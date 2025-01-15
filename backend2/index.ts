import { WebSocket, WebSocketServer } from "ws";
import { INIT_GAME } from "./messages";
import { GameManager } from "./GameManager";
const wss = new WebSocketServer({ port: 8080 });

const Game = new GameManager();
wss.on("connection", (ws) => {
  ws.on("error", (e) => {
    console.log("Error: ", e);
  });
  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    if (message.type === INIT_GAME) {
      Game.addUser(ws, parseInt(message.payload));
    } else {
      console.log("Play Hit: ", message);
      Game.playGame(ws, message);
    }
  });
  ws.on("disconnect", () => {
    Game.removeUser(ws);
  });
});
