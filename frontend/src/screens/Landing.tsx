import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="grid  grid-cols-2">
      <div className="flex col-span-1 justify-center">
        <img src={"/chessBoard.jpeg"} className="h-screen" alt="sueuhesfoi" />
      </div>
      <div className="col-span-1 flex flex-col items-center justify-center md:p-12 space-y-4">
        <div className=" text-white text-6xl font-bold text-balance text-center">
          Play Chess Online on the #2 Site!
        </div>
        <Button onClick={() => navigate("/game")}>Play Online</Button>
      </div>
    </div>
  );
};
