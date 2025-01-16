import { Chess, type Square } from "chess.js";
import { BOARD, ERROR, GAME_OVER, INIT_GAME, MOVE, MOVES } from "./messages";
import { WebSocket } from "ws";

export class Game {
  public player1: WebSocket | null;
  public player2: WebSocket | null;
  private board: Chess;
  private TimeLimit: number;
  private timers: { [key: string]: ReturnType<typeof setTimeout> | null };
  private remainingTime: { [key: string]: number };
  private turn: WebSocket | null;

  constructor(player1: WebSocket, player2: WebSocket, TimeLimit: number) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.TimeLimit = TimeLimit;
    this.turn = player1;
    this.remainingTime = { White: TimeLimit * 1000, Black: TimeLimit * 1000 };
    this.timers = { White: null, Black: null };

    this.player1.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: "White",
      })
    );
    this.player2.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: "Black",
      })
    );

    this.startTimer("White");
  }

  private startTimer(color: string) {
    const opponentColor = color === "White" ? "Black" : "White";

    if (this.timers[opponentColor]) {
      clearTimeout(this.timers[opponentColor]!);
      this.timers[opponentColor] = null;
    }

    const startTime = Date.now();
    this.timers[color] = setTimeout(() => {
      this.endGame(opponentColor);
    }, this.remainingTime[color]);

    if (this.timers[color]) {
      clearTimeout(this.timers[color]!);
      const elapsedTime = Date.now() - startTime;
      this.remainingTime[color] -= elapsedTime;
      if (this.remainingTime[color] <= 0) {
        this.endGame(opponentColor);
      }
    }
  }

  public timeLeft(color: string) {
    return this.remainingTime[color];
  }

  private endGame(winningColor: string) {
    this.player1?.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: winningColor,
      })
    );
    this.player2?.send(
      JSON.stringify({
        type: GAME_OVER,
        payload: winningColor,
      })
    );

    if (this.timers["White"]) clearTimeout(this.timers["White"]!);
    if (this.timers["Black"]) clearTimeout(this.timers["Black"]!);
  }

  currentBoard() {
    return this.board.board();
  }
  sendBoard() {
    const board = this.currentBoard();
    this.player1?.send(
      JSON.stringify({
        type: BOARD,
        payload: this.currentBoard(),
      })
    );
    this.player2?.send(
      JSON.stringify({
        type: BOARD,
        payload: this.currentBoard(),
      })
    );
  }

  possibleMoves(player: WebSocket, square: Square) {
    if (player !== this.turn) return;
    player.send(
      JSON.stringify({
        type: MOVES,
        payload: this.board.moves({ square: square }),
      })
    );
  }

  makeMove(player: WebSocket, move: { from: string; to: string }) {
    if (player !== this.turn) return;
    try {
      const makeMove = this.board.move(move);
      this.turn = this.turn === this.player1 ? this.player2 : this.player1;
      if (!makeMove) throw new Error("Illegal Move");

      this.player1?.send(
        JSON.stringify({
          type: MOVE,
          payload: this.currentBoard(),
        })
      );
      this.player2?.send(
        JSON.stringify({
          type: MOVE,
          payload: this.currentBoard(),
        })
      );

      if (this.board.isGameOver()) {
        this.endGame(player === this.player1 ? "White" : "Black");
        return;
      }

      const nextPlayerColor = this.board.turn() === "w" ? "White" : "Black";
      this.startTimer(nextPlayerColor);
    } catch (e) {
      player.send(
        JSON.stringify({
          type: ERROR,
          payload: "Illegal Move",
        })
      );
    }
  }
}
