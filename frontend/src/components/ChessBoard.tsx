import { Color, PieceSymbol, Square } from "chess.js";
import Pawn_Black from "../assets/Pawn_Black.png";
import Pawn_White from "../assets/Pawn_White.png";
import Rook_Black from "../assets/Rook_Black.png";
import Rook_White from "../assets/Rook_White.png";
import Knight_Black from "../assets/Knight_Black.png";
import Knight_White from "../assets/Knight_White.png";
import Bishop_Black from "../assets/Bishop_Black.png";
import Bishop_White from "../assets/Bishop_White.png";
import Queen_Black from "../assets/Queen_Black.png";
import Queen_White from "../assets/Queen_White.png";
import King_Black from "../assets/King_Black.png";
import King_White from "../assets/King_White.png";
import { useEffect, useState } from "react";
import { MOVE, MOVES } from "../screens/Game";

const pieceImages: Record<string, string> = {
  p_b: Pawn_Black,
  p_w: Pawn_White,
  r_b: Rook_Black,
  r_w: Rook_White,
  n_b: Knight_Black,
  n_w: Knight_White,
  b_b: Bishop_Black,
  b_w: Bishop_White,
  q_b: Queen_Black,
  q_w: Queen_White,
  k_b: King_Black,
  k_w: King_White,
};

export const ChessBoard = ({
  board,
  socket,
}: {
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
}) => {
  const [from, setFrom] = useState<Square | null>();
  const [attacks, setAttacks] = useState<string[] | null>();
  const [boardState, setBoardState] = useState(board);

  useEffect(() => {
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "UPDATE_STATE") {
        console.log(message);
        setBoardState(message.board);
      } else if (message.type === MOVES) {
        setAttacks(message.payload);
      }
    };
  }, [socket, board]);

  return (
    <div className="text-black">
      {boardState.map((row, i) => (
        <div key={i} className="flex">
          {row.map((square, j) => {
            let squareCoords = indexToChess(i, j);
            const pieceKey = square ? `${square.type}_${square.color}` : null;
            const isUnderAttack = attacks?.includes(squareCoords);
            return (
              <div
                key={j}
                onClick={() => {
                  if (from && attacks?.includes(squareCoords)) {
                    socket.send(
                      JSON.stringify({
                        type: MOVE,
                        move: { from, to: squareCoords },
                      })
                    );
                    setFrom(null);
                    setAttacks(null);
                  } else if (square) {
                    setFrom(square.square);
                    socket.send(
                      JSON.stringify({
                        type: MOVES,
                        payload: squareCoords,
                      })
                    );
                  }
                }}
                className={`w-16 h-16 flex justify-center items-center ${
                  (i + j) % 2 === 0 ? "bg-green-500" : "bg-white"
                } ${isUnderAttack ? "ring-4 ring-red-500" : ""}`}
              >
                {pieceKey && pieceImages[pieceKey] ? (
                  <img
                    src={pieceImages[pieceKey]}
                    alt={`${square?.type} ${square?.color}`}
                    className="w-12 h-12"
                  />
                ) : isUnderAttack ? (
                  <div className="w-6 h-6 rounded-full bg-red-500"></div>
                ) : null}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

function indexToChess(i: number, j: number) {
  const file = String.fromCharCode("a".charCodeAt(0) + j);
  const rank = 8 - i;

  return `${file}${rank}`;
}
