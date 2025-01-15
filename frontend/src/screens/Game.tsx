import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../Hooks/useSocket";
import { Chess, Color, PieceSymbol, Square } from "chess.js";

export const MOVES = "moves";
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const ERROR = "error";
export const GAME_OVER = "game_over";
export const BOARD = "board";
type Board = ({
  square: Square;
  type: PieceSymbol;
  color: Color;
} | null)[][];

export const Game = () => {
  const socket = useSocket();
  const [board, setBoard] = useState<Board>();
  const [findUser, setFindUser] = useState(false);
  if (!socket) return <div>Connecting ...</div>;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.type === INIT_GAME) {
      setFindUser(false);
    }
    if (message.type === BOARD) {
      setBoard(message.payload);
    }
  };
  return (
    <div className="justify-center flex">
      <div className="pt-8 w-full">
        <div className="grid grid-cols-6 gap-4 ">
          <div className="flex justify-center  col-span-4">
            {board && <ChessBoard board={board} socket={socket} />}
            {findUser && <div className="text-white">Finding Players ....</div>}
          </div>
          <div className="flex items-center justify-center col-span-2 ">
            <Button
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    type: INIT_GAME,
                  })
                );
                setFindUser(true);
              }}
            >
              Play
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
