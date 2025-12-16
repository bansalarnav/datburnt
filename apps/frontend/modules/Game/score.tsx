import { useEffect, useRef, useState } from "react";
import PrimaryButton from "../../components/Button/Primary";
import { useUserStore } from "../../utils/userStore";
import useSound from "use-sound";

const colors = [
  "#DA8C18",
  "#DA3B18",
  "#2A5FE8",
  "#5715E2",
  "#3CDA14",
  "#07C269",
  "#F35B05",
  "#9018DA",
];

interface ScoreData {
  score: number;
  avatarUrl: string;
  [key: string]: any;
}

interface ScoreProps {
  scores: ScoreData[];
  owner: string;
  nextRound: () => void;
  currentRound: number;
}

const Score = ({ scores, owner, nextRound, currentRound }: ScoreProps) => {
  const { user } = useUserStore();
  const [highestScore, setHighestScore] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const [play] = useSound("/sounds/monkeys.mp3");

  useEffect(() => {
    play();
  }, [play]);

  useEffect(() => {
    let h = 0;
    scores.forEach((s) => {
      if (s.score > h) {
        h = s.score;
      }
    });
    setHighestScore(h);
  }, [scores]);

  return (
    <div className="w-screen h-[80vh] flex flex-col items-center justify-center mb-20">
      <h1 className="text-grey-700 font-extrabold text-4xl">Scorecheck</h1>
      <div className="w-full h-full flex-1 mb-[35px] flex flex-col items-center justify-end" ref={containerRef}>
        <div className="flex-1 w-[90%] flex justify-around mt-5">
          {scores.map((score, i) => {
            return (
              <div
                key={i}
                style={{
                  height: "100%",
                  width: `${100 / scores.length}%`,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  maxWidth: "180px",
                }}
              >
                <div
                  style={{
                    height: `${(score.score / highestScore) * 100}%`,
                    width: `calc(100% - 40px)`,
                    background: colors[i],
                    borderRadius: "14px 14px 0 0",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    paddingBottom: "20px",
                    fontSize: "2em",
                    fontWeight: 700,
                    color: score.score === 0 ? "#5E5E5E" : "#fff",
                  }}
                >
                  {score.score}
                </div>
              </div>
            );
          })}
        </div>
        <div className="w-[90%] h-0.5 bg-grey-200"></div>
        <div className="h-[90px] w-[90%] flex flex-row">
          {scores.map((s, idx) => {
            return (
              <div
                key={idx}
                style={{
                  height: "90px",
                  width: `${100 / scores.length}%`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <img src={s.avatarUrl} alt="Player avatar" className="h-[60px] w-[60px] rounded-full border-[5px] border-primary" />
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between fixed bottom-0 left-0 w-screen h-20 bg-white py-5">
        <div className="font-semibold text-grey-800 text-xl ml-[3vw]">The game&apos;s not over yet ;)</div>
        <div className="mr-[2vw]">
          {user && user._id === owner ? (
            <PrimaryButton onClick={() => nextRound()}>
              {currentRound == 5 ? "View Results!" : "Next Round"}
            </PrimaryButton>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Score;
