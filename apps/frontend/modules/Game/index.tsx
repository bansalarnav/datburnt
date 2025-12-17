import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import io, { type Socket } from "socket.io-client";
import Loader from "../../components/Loader";
import { useUserStore } from "../../utils/userStore";
import Results from "./result";
import Roast from "./roast";
import Score from "./score";
import Voting from "./voting";
import WaitingRoom from "./waiting";

let socket: Socket | null = null;

interface GameDetails {
  owner: string;
  currentRound: number;
  players: any[];
  maxPlayers?: number;
  private?: boolean;
  categories?: string[];
  code?: string;
  [key: string]: any;
}

interface RoundDetails {
  image?: string;
  category?: string;
  [key: string]: any;
}

const GameContent = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [details, setDetails] = useState<GameDetails>({
    owner: "",
    currentRound: 0,
    players: [],
  });
  const [currentRound, setCurrentRound] = useState(0);
  const [roundDetails, setRoundDetails] = useState<RoundDetails>({});
  const [voteCandidates, setVoteCandidates] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [showVoting, setShowVoting] = useState(false);
  const [showScores, setShowScores] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (user && router.query.code) {
      socket = io(`${process.env.NEXT_PUBLIC_API_URL}/game`, {
        withCredentials: true,
      });
      socket.emit("join-game", router.query.code);

      socket.on("game-details", (payload: any) => {
        if (!payload.success) {
          setLoading(false);
          setErrorMsg(payload.message);
        } else {
          setLoading(false);
          setErrorMsg(null);
          setPlayers(payload.game.players);
          setDetails(payload.game);
        }
      });

      socket.on("players", (players: any[]) => {
        setPlayers(players);
      });

      socket.on("next-round", (data: any) => {
        setCurrentRound(data.round);
        setRoundDetails(data.details);
        setVoteCandidates([]);
        setShowVoting(false);
        setShowScores(false);
        setShowResult(false);
      });

      socket.on("voting", (data: any[]) => {
        setShowVoting(true);
        setShowScores(false);
        setShowResult(false);
        setVoteCandidates(data);
      });

      socket.on("score", (data: any[]) => {
        setShowVoting(false);
        setShowScores(true);
        setShowResult(false);
        setScores(data);
      });

      socket.on("results", (data: any[]) => {
        setResults(data);
        setShowResult(true);
        setShowScores(false);
        setShowVoting(false);
      });

      socket.on("end", () => {
        router.push("/home");
      });
    }

    const handleBeforeUnload = () => {
      if (router.query.code) {
        socket?.emit("leave-game", router.query.code);
        socket?.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (router.query.code) {
        socket?.emit("leave-game", router.query.code);
        socket?.disconnect();
      }
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [router.query.code, user, router]);

  return (
    <>
      {loading || !socket ? (
        <div className="flex h-[80vh] w-full">
          <Loader center />
        </div>
      ) : (
        <div className="w-full">
          {errorMsg ? (
            <div className="flex h-[80vh] w-full justify-center items-center text-[34px] font-bold text-primary">
              {errorMsg}
            </div>
          ) : currentRound !== 0 ? (
            !showVoting && !showScores && !showResult ? (
              <Roast
                details={roundDetails}
                round={currentRound}
                submitRoast={(roast: string) =>
                  socket?.emit("submit", {
                    code: router.query.code,
                    roast: roast,
                  })
                }
              />
            ) : showVoting ? (
              <Voting
                details={roundDetails}
                voteCandidates={voteCandidates}
                submitVote={(vote: any) => {
                  socket?.emit("vote", {
                    code: router.query.code,
                    vote: vote,
                  });
                }}
              />
            ) : showScores ? (
              <Score
                scores={scores}
                owner={details.owner}
                nextRound={() => {
                  socket?.emit("next-round", router.query.code);
                }}
                currentRound={details.currentRound}
              />
            ) : showResult ? (
              <Results
                owner={details.owner}
                results={results}
                endGame={() => socket?.emit("end", router.query.code)}
              />
            ) : (
              <div></div>
            )
          ) : (
            <WaitingRoom
              details={details as any}
              onStart={() => {
                socket?.emit("start", router.query.code);
              }}
              players={players}
              removePlayer={(id: string) =>
                socket?.emit("remove-player", {
                  code: router.query.code,
                  id: id,
                })
              }
            />
          )}
        </div>
      )}
    </>
  );
};

export default GameContent;
