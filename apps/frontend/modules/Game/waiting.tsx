import { useEffect, useState } from "react";
import PrimaryButton from "../../components/Button/Primary";
import RemoveIcon from "../../public/icons/cross.svg";
import { useUserStore } from "../../utils/userStore";

interface Player {
  id: string;
  username: string;
  avatarUrl: string;
  [key: string]: any;
}

interface WaitingGameDetails {
  maxPlayers: number;
  private: boolean;
  categories: string[];
  code: string;
  owner: string;
  [key: string]: any;
}

interface WaitingRoomProps {
  details: WaitingGameDetails;
  players: Player[];
  onStart: () => void;
  removePlayer: (id: string) => void;
}

const WaitingRoom = ({
  details,
  players,
  onStart,
  removePlayer,
}: WaitingRoomProps) => {
  const { user } = useUserStore();
  const [ps, setPs] = useState<Player[]>([]);

  useEffect(() => {
    if (!user) return;

    const mIndex = players.findIndex((p) => p.id === user._id);
    const newPlayers = [...players];
    newPlayers.splice(mIndex, 1);

    const newPs = [players[mIndex], ...newPlayers];

    setPs(newPs);
  }, [players, user]);

  const getCategoryClassName = (category: string): string => {
    const categoryMap: Record<string, string> = {
      Politics: "bg-[#0b50b826] text-[#0b50b8]",
      Sports: "bg-[#0bb85026] text-[#0bb850]",
      Celebs: "bg-[#ee2a2a26] text-[#ee2a2a]",
      Companies: "bg-[#ed981926] text-[#ed9819]",
      Chats: "bg-[#d51de526] text-[#d51de5]",
      Random: "bg-[#f412c326] text-[#f412c3]",
    };
    return categoryMap[category] || "";
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-screen mb-[120px]">
      <h1 className="text-grey-700 font-extrabold text-[40px] m-0 mt-[5vh] mb-[4vh]">
        Waiting for more players...
      </h1>
      <div className="w-1/2 flex flex-col items-center px-7 py-7 pb-5 justify-center bg-white rounded-[14px]">
        <div className="flex flex-row items-center justify-between w-full">
          <div className="text-grey-900 font-bold text-xl self-start text-left">
            No. of Players:{" "}
            <span className="text-grey-600">{players.length}</span>
          </div>
          <div className="text-grey-900 font-bold text-xl text-center self-center">
            Maximum Players:{" "}
            <span className="text-grey-600">{details.maxPlayers}</span>
          </div>
          <div className="text-primary font-bold text-xl text-right">
            {details.private ? "⠀⠀⠀⠀⠀⠀Private" : `⠀⠀⠀⠀⠀⠀⠀Public`}
          </div>
        </div>
        <div className="flex flex-row mt-8 w-full">
          <div className="mr-5 text-grey-900 font-bold text-xl mt-1">
            Categories:{" "}
          </div>
          <div className="flex flex-row items-center flex-wrap">
            {details.categories.map((category) => {
              return (
                <div
                  key={category}
                  className={`py-2.5 px-5 w-20 mb-2 flex items-center justify-center mr-2.5 font-bold rounded-[10px] ${getCategoryClassName(category)}`}
                >
                  {category}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="flex flex-row mt-[4vh] w-4/5 flex-wrap overflow-scroll justify-center">
        {ps.map((player) => {
          return (
            <div
              className="flex flex-row items-center w-[30%] min-w-[180px] max-w-[240px] px-6 py-4 bg-white rounded-[14px] mx-3.5 my-3.5"
              key={player.id}
            >
              <div className="mr-5 w-[50px] h-[50px] rounded-full flex items-center border-[5px] border-primary justify-center">
                <img
                  className="w-[50px] h-[50px] rounded-full"
                  src={player.avatarUrl}
                  width={55}
                  height={55}
                  alt={player.username}
                />
              </div>
              <div>
                <div className="font-extrabold text-xl text-grey-700 overflow-hidden whitespace-nowrap text-ellipsis">
                  {player.username}
                </div>
                <div className="text-grey-800 text-lg font-semibold mt-1.5">
                  {user && player.id === user._id && "You"}
                </div>
              </div>
              <div style={{ width: "100%" }} />
              {user && details.owner === user._id && player.id !== user._id && (
                <div
                  onClick={() => removePlayer(player.id)}
                  className="text-primary cursor-pointer"
                >
                  <RemoveIcon />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-row items-center justify-between fixed bottom-0 w-screen h-20 bg-white p-5">
        <div className="flex items-center justify-center text-grey-800 font-semibold text-xl ml-[2vw]">
          Game Code:⠀
          <span className="text-primary font-extrabold">{details.code}</span>
        </div>
        <div className="mr-[2vw] flex">
          {players.length < 3 && (
            <div className="flex items-center justify-center text-grey-800 font-semibold text-xl mr-[2vw]">
              You need {3 - players.length} player
              {3 - players.length === 1 ? "" : "s"} more to start the game
            </div>
          )}
          {user && details.owner === user._id && (
            <PrimaryButton
              className="w-[200px]"
              onClick={onStart}
              disabled={players.length < 3}
            >
              Start Game
            </PrimaryButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitingRoom;
