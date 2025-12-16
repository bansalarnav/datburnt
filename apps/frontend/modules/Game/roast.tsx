import { useState, useEffect } from "react";
import PrimaryButton from "../../components/Button/Primary";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import useSound from "use-sound";

interface RoastDetails {
  image?: string;
  category?: string;
  [key: string]: any;
}

interface RoastProps {
  round: number;
  details: RoastDetails;
  submitRoast: (roast: string) => void;
}

const Roast = ({ round, details, submitRoast }: RoastProps) => {
  const [countdown, setCountdown] = useState(3);
  const [playCountdown, { stop }] = useSound(
    "/sounds/countdown.mp3"
  );

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown < 0) {
        stop();
        clearInterval(interval);
      } else {
        setCountdown(countdown - 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [countdown, stop]);

  useEffect(() => {
    playCountdown();
  }, [playCountdown]);

  return (
    <div
      style={{
        height: "80vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {countdown < 0 ? (
        <RoastForm round={round} details={details} submitRoast={submitRoast} />
      ) : (
        <div className="font-bold text-[90px] text-primary">
          {countdown == 0 ? "Go!" : countdown}
        </div>
      )}
    </div>
  );
};

interface RoastFormProps {
  round: number;
  details: RoastDetails;
  submitRoast: (roast: string) => void;
}

const RoastForm = ({ round, details, submitRoast }: RoastFormProps) => {
  const [myRoast, setMyRoast] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [countdown, setCountdown] = useState(30);

  const [playOof, { stop: stopOof }] = useSound("/sounds/oof.mp3");
  const [playTicking, { stop: stopTicking }] = useSound("/sounds/ticking.mp3");
  const [playBeep] = useSound("/sounds/beep.mp3");

  useEffect(() => {
    const interval = setInterval(() => {
      if (countdown == 0) {
        clearInterval(interval);
        if (!submitted) {
          const interval2 = setInterval(() => {
            stopOof();
            submitRoast("");
            clearInterval(interval2);
          }, 2000);
        }
      } else {
        if (countdown == 11) {
          if (!submitted) {
            playTicking();
          }
        }

        if (submitted) {
          stopTicking();
        }

        if (countdown == 1) {
          stopTicking();
          playOof();
        }
        setCountdown(countdown - 1);
        clearInterval(interval);
      }
    }, 1000);

    return () => {
      clearInterval(interval);
      stopTicking();
      stopOof();
    };
  }, [countdown, submitted, playTicking, stopTicking, playOof, stopOof, submitRoast]);

  const handleSubmit = () => {
    if (myRoast.length > 0) {
      playBeep();
      submitRoast(myRoast);
      stopTicking();
      setSubmitted(true);
    }
  };

  return (
    <div>
      <div className="w-screen h-full flex flex-col items-center justify-center">
        <h1 className="text-[#4e4e4e] font-extrabold text-[32px] mb-[4vh]">Round {round}</h1>
        <div>
          <img src={details.image} className="h-[40vh] object-cover rounded-[14px]" alt="Roast target" />
          <p className="text-base font-semibold text-[#7d7d7d] m-0">Category: {details.category}</p>
        </div>
        {countdown <= 0 && !submitted ? (
          <div className="text-primary font-extrabold text-[32px] mt-[4vh]">Time's Up!</div>
        ) : submitted ? (
          <div className="text-primary font-extrabold text-[32px] mt-[4vh]">I bet that one hurt</div>
        ) : (
          <form
            className="flex items-center justify-center w-full mt-[4vh]"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <input
              className="border-[3px] border-[#d9d9d9] text-lg text-[#797979] py-3.5 px-5 pl-8 translate-y-1 w-[32vw] mr-4 font-medium rounded-[14px] h-[30px] focus:outline-none"
              placeholder="Your Roast"
              value={myRoast}
              onChange={(e) => setMyRoast(e.target.value)}
            />
            <PrimaryButton onClick={handleSubmit}>
              Roast!
            </PrimaryButton>
          </form>
        )}
      </div>

      <div className="flex flex-row items-center justify-between fixed bottom-0 w-screen bg-white p-5 pr-5 h-20">
        <div className="font-semibold text-[#5e5e5e] text-xl ml-[3vw]">
          {countdown <= 0 && !submitted ? (
            <span>Waiting for others to submit...</span>
          ) : submitted ? (
            <span>Waiting for others to submit...</span>
          ) : (
            <span>Hurry Up Bruv! People are submitting!</span>
          )}
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

export default Roast;
