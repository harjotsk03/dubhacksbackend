const lobbyRepo = require("../db/repos/lobbyRepos.js");

const lobbies = new Map();

async function broadcastLobbyList(io) {
  try {
    const dbLobbies = await lobbyRepo.getAllLobbies();
    const lobbyList = dbLobbies.map((dbLobby) => {
      const memoryLobby = lobbies.get(dbLobby.id);
      return {
        id: dbLobby.id,
        userCount: memoryLobby ? memoryLobby.users.length : 0,
        users: memoryLobby ? memoryLobby.users : [],
        createdAt: dbLobby.created_at,
        isFull: memoryLobby ? memoryLobby.users.length >= 4 : false,
      };
    });
    io.emit("lobbies_updated", lobbyList);
  } catch (err) {
    console.error("Error broadcasting lobby list:", err);
  }
}

function lobbySocket(io) {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // --- Fetch all lobbies ---
    socket.on("get_lobbies", async () => {
      try {
        const dbLobbies = await lobbyRepo.getAllLobbies();
        const lobbyList = dbLobbies.map((dbLobby) => {
          const memoryLobby = lobbies.get(dbLobby.id);
          return {
            id: dbLobby.id,
            userCount: memoryLobby ? memoryLobby.users.length : 0,
            users: memoryLobby ? memoryLobby.users : [],
            createdAt: dbLobby.created_at,
            isFull: memoryLobby ? memoryLobby.users.length >= 4 : false,
          };
        });
        socket.emit("lobbies_list", lobbyList);
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Failed to fetch lobbies" });
      }
    });

    // --- Create a new lobby ---
    socket.on("create_lobby", async (userName) => {
      try {
        const lobbyId = generateLobbyId();
        await lobbyRepo.insertLobby(lobbyId);

        const lobby = {
          id: lobbyId,
          users: [{ id: socket.id, name: userName || "Anonymous" }],
          createdAt: new Date(),
        };
        lobbies.set(lobbyId, lobby);
        socket.join(lobbyId);

        socket.emit("lobby_created", lobby);
        io.emit("lobbies_updated", Array.from(lobbies.values()));

        console.log(`🎮 Lobby created: ${lobbyId} by ${userName}`);
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Failed to create lobby" });
      }
    });

    // --- Join a lobby ---
    socket.on("join_lobby", async ({ lobbyId, userName }) => {
      try {
        let lobby = lobbies.get(lobbyId);

        if (!lobby) {
          const dbLobbies = await lobbyRepo.getAllLobbies();
          const dbLobby = dbLobbies.find((l) => l.id === lobbyId);

          if (!dbLobby) {
            socket.emit("error", { message: "Lobby not found" });
            return;
          }

          lobby = {
            id: lobbyId,
            users: [],
            createdAt: dbLobby.created_at,
          };
          lobbies.set(lobbyId, lobby);
        }

        if (!lobby.users.find((u) => u.id === socket.id)) {
          if (lobby.users.length >= 4) {
            socket.emit("error", { message: "Lobby is full" });
            return;
          }
          lobby.users.push({ id: socket.id, name: userName || "Anonymous" });
        }

        socket.join(lobbyId);
        socket.emit("lobby_joined", lobby);
        io.to(lobbyId).emit("user_joined", { lobbyId, users: lobby.users });

        console.log(`👤 ${userName} joined lobby: ${lobbyId}`);
      } catch (err) {
        console.error(err);
        socket.emit("error", { message: "Failed to join lobby" });
      }
    });

    // --- Get lobby state ---
    socket.on("get_lobby", (lobbyId) => {
      const lobby = lobbies.get(lobbyId);
      socket.emit(
        "lobby_data",
        lobby || { id: lobbyId, users: [], createdAt: new Date() }
      );
    });

    // --- Select character ---
    socket.on("select_character", ({ lobbyId, charId, selectedBy }) => {
      const lobby = lobbies.get(lobbyId);
      if (!lobby) return;

      if (!lobby.characters) {
        // Initialize characters for the lobby
        lobby.characters = [
          { id: 1, name: "Boat", selected: false, selectedBy: null },
          { id: 2, name: "Boot", selected: false, selectedBy: null },
          { id: 3, name: "Dog", selected: false, selectedBy: null },
          { id: 4, name: "Car", selected: false, selectedBy: null },
        ];
      }

      const char = lobby.characters.find((c) => c.id === charId);
      if (!char || char.selected) return; // already taken

      char.selected = true;
      char.selectedBy = selectedBy;

      // Broadcast updated character to lobby
      io.to(lobbyId).emit("character_selected", { charId, selectedBy });
    });

    // --- Leave lobby ---
    socket.on("leave_lobby", (lobbyId) => {
      const lobby = lobbies.get(lobbyId);
      if (!lobby) return;

      // Remove the user
      const leavingUser = lobby.users.find((u) => u.id === socket.id);
      lobby.users = lobby.users.filter((u) => u.id !== socket.id);

      // Free their character, if any
      if (lobby.characters) {
        lobby.characters.forEach((c) => {
          if (c.selectedBy === leavingUser?.name) {
            c.selected = false;
            c.selectedBy = null;
            io.to(lobbyId).emit("character_deselected", { charId: c.id });
          }
        });
      }

      socket.leave(lobbyId);

      if (lobby.users.length === 0) {
        lobbies.delete(lobbyId);
        console.log(`🗑️  Lobby removed: ${lobbyId}`);
      } else {
        io.to(lobbyId).emit("user_left", { lobbyId, users: lobby.users });
      }

      broadcastLobbyList(io);
    });


    // --- Disconnect ---
    socket.on("disconnect", () => {
  console.log(`❌ User disconnected: ${socket.id}`);
  lobbies.forEach((lobby, lobbyId) => {
    const leavingUser = lobby.users.find((u) => u.id === socket.id);
    if (!leavingUser) return;

    // Remove user
    lobby.users = lobby.users.filter((u) => u.id !== socket.id);

    // Free their character
    if (lobby.characters) {
      lobby.characters.forEach((c) => {
        if (c.selectedBy === leavingUser.name) {
          c.selected = false;
          c.selectedBy = null;
          io.to(lobbyId).emit("character_deselected", { charId: c.id });
        }
      });
    }

    if (lobby.users.length === 0) {
      lobbies.delete(lobbyId);
    } else {
      io.to(lobbyId).emit("user_left", { lobbyId, users: lobby.users });
    }
  });
  broadcastLobbyList(io);
});

  });
}

function generateLobbyId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

module.exports = lobbySocket;
