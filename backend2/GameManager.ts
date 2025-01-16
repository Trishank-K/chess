import { Game } from "./Game";
import { WebSocket } from "ws";
import { BOARD, INIT_GAME, MOVE, MOVES } from "./messages";

export class GameManager {
  private games: Game[];
  private pendingUser: WebSocket | null;
  private users: WebSocket[];
  constructor() {
    this.games = [];
    this.pendingUser = null;
    this.users = [];
  }

  addUser(socket: WebSocket, TimeLimit: number) {
    if (!this.pendingUser) {
      this.pendingUser = socket;
    } else {
      const game = new Game(this.pendingUser, socket, TimeLimit);
      this.games.push(game);
      game.player1?.send(
        JSON.stringify({
          type: INIT_GAME,
        })
      );
      game.player2?.send(
        JSON.stringify({
          type: INIT_GAME,
        })
      );
      game.sendBoard();
      this.pendingUser = null;
    }
    this.users.push(socket);
  }
  removeUser(socket: WebSocket) {
    this.users = this.users.filter((user) => user != socket);
    const pendingGame = this.games.find(
      (game) => game.player1 == socket || game.player2 == socket
    );
    const pendingUser =
      pendingGame?.player1 === socket
        ? pendingGame.player2
        : pendingGame?.player1;
    this.games = this.games.filter(
      (game) => game.player1 != socket && game.player2 != socket
    );
    if (pendingUser) {
      this.addUser(pendingUser, 10);
    }
  }
  playGame(socket: WebSocket, message: { type: String; payload: any }) {
    const game = this.games.find(
      (game) => game.player1 === socket || game.player2 === socket
    );
    if (message.type === MOVE) {
      game?.makeMove(socket, message.payload);
    } else if (message.type === MOVES) {
      game?.possibleMoves(socket, message.payload);
    } else if (message.type === BOARD) {
      game?.sendBoard();
    }
  }
}
