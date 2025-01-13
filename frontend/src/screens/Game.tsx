import { useEffect, useState } from "react";
import { Button } from "../components/Button";
import { ChessBoard } from "../components/ChessBoard";
import { useSocket } from "../Hooks/useSocket";
import { Chess } from "chess.js";

export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export const Game = () => {
  const socket = useSocket();
  const [chess, setChess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log(message);
      switch (message.type) {
        case INIT_GAME:
          setChess(new Chess());
          setBoard(chess.board());
          console.log("INITIALIZED");
          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setBoard(chess.board());
          console.log("MOVE MADE");
          break;
        case GAME_OVER:
          console.log("GAME OVER");
      }
    };
  }, [socket]);
  if (!socket) return <div>Connecting ...</div>;
  return (
    <div className="justify-center flex">
      <div className="pt-8 w-full">
        <div className="grid grid-cols-6 gap-4 ">
          <div className="flex justify-center  col-span-4">
            <ChessBoard chess={chess} board={board} />
          </div>
          <div className="flex items-center justify-center col-span-2 ">
            <Button
              onClick={() => {
                socket.send(
                  JSON.stringify({
                    type: INIT_GAME,
                  })
                );
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
