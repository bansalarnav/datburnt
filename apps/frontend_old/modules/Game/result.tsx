import { useEffect } from "react";
import useSound from "use-sound";
import PrimaryButton from "../../components/Button/Primary";
import { useUserStore } from "../../utils/userStore";

interface ResultData {
  id: string;
  username: string;
  avatarUrl: string;
  score: number;
  [key: string]: any;
}

interface ResultProps {
  owner: string;
  results: ResultData[];
  endGame: () => void;
}

const Result = ({ owner, results, endGame }: ResultProps) => {
  const { user } = useUserStore();
  const [playNyan] = useSound("/sounds/thug_life.mp3");

  useEffect(() => {
    if (playNyan) {
      const interval = setInterval(() => {
        // Keeping the interval alive
      }, 17000);
      playNyan();
      return () => clearInterval(interval);
    }
  }, [playNyan]);

  function getEnding(place: number): string {
    if (place === 1) {
      return "st";
    } else if (place === 2) {
      return "nd";
    } else if (place === 3) {
      return "rd";
    } else {
      return "th";
    }
  }

  return (
    <div className="w-screen h-full flex flex-col items-center justify-center">
      <h1 className="text-grey-700 font-extrabold text-[32px] mb-[4vh]">
        Results
      </h1>
      <div className="w-screen h-[70vh] pb-20 flex justify-center items-center [&>div]:w-[8vw] [&>div]:overflow-hidden [&>div]:whitespace-nowrap [&>div]:text-ellipsis">
        <div className="h-full flex flex-col items-center justify-end">
          <img
            src={results[1].avatarUrl}
            className="rounded-full h-[110px] w-[110px] border-[7px] border-primary"
            alt={results[1].username}
          />
          <p className="font-bold text-grey-700 text-2xl overflow-hidden whitespace-nowrap text-ellipsis text-center w-full">
            {results[1].username}
          </p>
          <div className="w-40 h-[calc(100%-315px)] bg-[#b7b7b7] rounded-tl-[14px] flex flex-col text-white font-bold text-[30px] justify-end items-center mb-[60px] min-h-[110px] pb-5">
            2nd
          </div>
        </div>
        <div className="h-full flex flex-col items-center justify-end">
          <img
            src={results[0].avatarUrl}
            className="rounded-full h-[110px] w-[110px] border-[7px] border-primary"
            alt={results[0].username}
          />
          <p className="font-bold text-grey-700 text-2xl overflow-hidden whitespace-nowrap text-ellipsis text-center w-full">
            {results[0].username}
          </p>
          <div className="w-40 h-[calc(100%-265px)] bg-[#eea210] rounded-t-[14px] flex flex-col text-white font-bold text-[30px] justify-end items-center mb-[60px] min-h-[160px] pb-5">
            1st
          </div>
        </div>
        <div className="h-full flex flex-col items-center justify-end">
          <img
            src={results[2].avatarUrl}
            className="rounded-full h-[110px] w-[110px] border-[7px] border-primary"
            alt={results[2].username}
          />
          <p className="font-bold text-grey-700 text-2xl overflow-hidden whitespace-nowrap text-ellipsis text-center w-full">
            {results[2].username}
          </p>
          <div className="w-40 h-[calc(100%-365px)] bg-[#a4402a] rounded-tr-[14px] flex flex-col text-white font-bold text-[30px] justify-end items-center mb-[60px] min-h-[60px] pb-5">
            3rd
          </div>
        </div>
      </div>
      <div className="flex flex-row items-center justify-between fixed bottom-0 w-screen h-20 bg-white p-5 pr-20">
        <div className="font-semibold text-grey-800 text-xl ml-[60px]">
          Congratulations! You are on{" "}
          {user && results.findIndex((p) => p.id === user._id) + 1}
          {user && getEnding(results.findIndex((p) => p.id === user._id) + 1)}{" "}
          place!
        </div>
        <div style={{ flex: 1 }} />
        {user && owner === user._id && (
          <PrimaryButton className="w-[200px]" onClick={endGame}>
            End Game
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};

export default Result;
