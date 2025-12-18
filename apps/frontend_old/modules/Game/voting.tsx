import { useEffect, useState } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import useSound from "use-sound";
import { useUserStore } from "../../utils/userStore";

interface Candidate {
  userid: string;
  roast: string;
  [key: string]: any;
}

interface VotingDetails {
  image?: string;
  category?: string;
  [key: string]: any;
}

interface VotingProps {
  details: VotingDetails;
  voteCandidates: Candidate[];
  submitVote: (vote: string) => void;
}

const Voting = ({ details, voteCandidates, submitVote }: VotingProps) => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const { user } = useUserStore();

  const [startCountdown, setStartCountdown] = useState(false);
  const [voted, setVoted] = useState(false);
  const [vote, setVote] = useState("");

  const [playOof, { stop: stopOof }] = useSound("/sounds/oof.mp3");
  const [playTicking, { stop: stopTicking }] = useSound("/sounds/ticking.mp3");
  const [playBeep] = useSound("/sounds/beep.mp3");

  useEffect(() => {
    if (!user) return;

    const c: Candidate[] = [];
    voteCandidates.forEach((can) => {
      if (can.roast.replaceAll(" ", "").length > 0 && can.userid !== user._id) {
        c.push(can);
      }
    });
    setCandidates(c);

    if (c.length < 2) {
      if (!voted) {
        setTimeout(() => {
          if (!voted) {
            submitVote("NEO");
          }
          setVoted(true);
        }, 2000);
      }
    }

    if (voteCandidates.length >= 2) {
      setStartCountdown(true);
    }
  }, [voteCandidates, user, voted, submitVote]);

  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    if (startCountdown) {
      const interval = setInterval(() => {
        if (countdown <= 0) {
          clearInterval(interval);
          if (!voted) {
            const interval2 = setInterval(() => {
              stopOof();
              submitVote("");
              clearInterval(interval2);
            }, 2000);
          }
        } else {
          if (countdown === 11) {
            if (!voted) {
              playTicking();
            }
          }

          if (voted) {
            stopTicking();
          }

          if (countdown === 1) {
            stopTicking();
            playOof();
          }
          setCountdown(countdown - 1);
          clearInterval(interval);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [
    countdown,
    startCountdown,
    voted,
    playTicking,
    stopTicking,
    playOof,
    stopOof,
    submitVote,
  ]);

  return (
    <div className="w-screen h-full flex flex-col items-center justify-center">
      <h1 className="text-[#4e4e4e] font-extrabold text-4xl">Voting!</h1>
      <div className="text-[#4e4e4e] font-semibold text-lg mb-[4vh]">
        Vote for the roast you think would have hurt the most!
      </div>
      <div className="flex flex-row justify-between w-[80vw] h-full mt-[2vh] pb-20">
        <div className="flex flex-col">
          <img
            src={details.image}
            className="rounded-[14px] h-[40vh]"
            alt="Voting target"
          />
          <span className="text-base font-semibold text-[#7d7d7d] m-0">
            Category: {details.category}
          </span>
        </div>
        <div className="ml-[10vw] pb-20 flex w-[60vw] flex-wrap h-min">
          {candidates.length < 2 ? (
            <div className="font-semibold text-[#5e5e5e] text-2xl mt-[8vh] ml-[3vw]">
              Not enough people submitted a roast :(
            </div>
          ) : (
            candidates.map((candidate) => {
              return (
                <div
                  className="py-7 px-8 min-w-[16vw] h-min shadow-[0px_8px_0px_#dbdbdb] bg-white text-[#686868] font-bold text-lg cursor-pointer rounded-[10px] mr-6 mb-6 transition-all duration-200 ease-in-out active:shadow-none"
                  key={candidate.userid}
                  style={
                    candidate.userid === vote
                      ? {
                          background: "#e93131",
                          boxShadow: "none",
                          color: "#fff",
                          transform: "translateY(8px)",
                        }
                      : {}
                  }
                  onClick={() => {
                    if (!voted) {
                      playBeep();
                      stopTicking();
                      setVoted(true);
                      setVote(candidate.userid);
                      submitVote(candidate.userid);
                    }
                  }}
                >
                  {candidate.roast}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="flex flex-row items-center justify-between fixed bottom-0 w-screen h-20 bg-white p-5">
        <div className="font-semibold text-[#5e5e5e] text-xl ml-[3vw]">
          If you do not vote, any votes to your roast won't be counted
        </div>
        <div className="font-bold text-[#434343] text-2xl mr-10">
          <CountdownCircleTimer
            size={84}
            isPlaying
            duration={30}
            colors={"#E93131"}
            strokeWidth={8}
          >
            {({ remainingTime }) => countdown}
          </CountdownCircleTimer>
        </div>
      </div>
    </div>
  );
};

export default Voting;
