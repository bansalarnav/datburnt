import { useState, useEffect, useRef } from "react";
import Loader from "../../components/Loader";
import io, { Socket } from "socket.io-client";
import { useUserStore } from "../../utils/userStore";
import { Popup, useOnClickOutside } from "../../components/Popup";
import PrimaryButton from "../../components/Button/Primary";
import Slider from "react-input-slider";
import { useRouter } from "next/router";
import { hop } from "@onehop/client";
import { useReadChannelState } from "@onehop/react";
import axios from "../../utils/axios";
import Image from "next/image";

const channelId = "online_users";

import PublicIcon from "../../public/icons/public.svg";
import PrivateIcon from "../../public/icons/private.svg";

interface Game {
  code: string;
  players: any[];
  [key: string]: any;
}

interface Friend {
  _id: string;
  name: string;
  avatar: string;
  [key: string]: any;
}

interface ChannelState {
  users: Array<{
    _id: string;
    [key: string]: any;
  }>;
}

export default function Content() {
  const { state } = useReadChannelState(channelId);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  const router = useRouter();

  const popupRef = useRef<HTMLDivElement>(null);
  const popupRef2 = useRef<HTMLDivElement>(null);
  const [visibility, setVisibility] = useState<"public" | "private">("public");
  const [playerNumber, setPlayerNumber] = useState(3);
  const [categories, setCategories] = useState<string[]>([
    "Politics",
    "Sports",
    "Celebs",
    "Companies",
  ]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useUserStore();
  const [popupState, setPopupState] = useState(false);
  const [popupState2, setPopupState2] = useState(false);
  const [friendUsername, setFriendUsername] = useState("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [onlineFriends, setOnlineFriends] = useState<Friend[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [codeInput, setCodeInput] = useState("");

  hop.init({
    projectId: "project_NDYyNjgzMTExOTM4NDU4MTc",
  });

  useOnClickOutside(popupRef, () => {
    setPopupState(false);
  });
  
  useOnClickOutside(popupRef2, () => {
    setPopupState2(false);
  });

  useEffect(() => {
    if (!user?.friends) return;

    user.friends.forEach((element: string) => {
      axios.post("/auth/getUserFromID", { userId: element }).then((res) => {
        setFriends((f) => [...f, res.data.user]);
      });
    });

    if (user && !socket) {
      const sock = io(`${process.env.NEXT_PUBLIC_API_URL}/home`, {
        withCredentials: true,
      });
      setSocket(sock);
    }

    const handleBeforeUnload = () => {
      socket?.disconnect();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      socket?.disconnect();
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    const channelState = state as unknown as ChannelState;
    if (state && channelState.users) {
      setOnlineFriends(
        friends.filter(
          (friend) =>
            channelState.users.filter(
              (usera: any) => usera._id.toString() === friend._id.toString()
            ).length > 0
        )
      );
    }
  }, [state, friends]);

  useEffect(() => {
    if (socket) {
      socket.on("games", (data: { games: Game[] }) => {
        setGames(data.games);
      });

      socket.on("redirect", (code: string) => {
        router.push(`/${code}`);
      });
    }
  }, [socket, router]);

  const toggleCategory = (category: string) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((cat) => cat !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  return (
    <>
      {loading || !socket ? (
        <div
          style={{
            display: "flex",
            height: "80vh",
          }}
        >
          <Loader center />
        </div>
      ) : (
        <div className="w-full">
          <div>
            {/* Header */}
            <div className="flex justify-between mt-16 mb-4 items-center">
              <h1 className="text-[32px] font-extrabold text-[#4e4e4e] m-0">Play Now!</h1>
              <div
                className="text-primary text-[28px] flex items-center font-medium cursor-pointer select-none justify-center"
                onClick={() => setPopupState(true)}
              >
                <span className="font-semibold text-xl mr-2.5">Create New Room </span>+
              </div>
            </div>

            {/* Join Section */}
            <div className="flex h-[220px]">
              <div className="mr-4 flex-grow flex justify-center items-center rounded-[14px] bg-white">
                <PrimaryButton
                  onClick={() => {
                    if (games.length > 0) {
                      const randomGame =
                        games[Math.floor(Math.random() * games.length)];
                      router.push(`/${randomGame.code}`);
                    }
                  }}
                >
                  Join Random Room
                </PrimaryButton>
              </div>
              <form
                className="flex-grow-[2.2] flex justify-center items-center bg-white rounded-[14px] ml-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (codeInput.replaceAll(" ", "").length > 0) {
                    router.push(`/${codeInput.replaceAll(" ", "")}`);
                  }
                }}
              >
                <input
                  className="border-[3px] border-[#d9d9d9] text-base text-[#797979] flex-grow-[0.5] py-3.5 px-5 pl-8 translate-y-1 mr-4 font-medium rounded-[10px] h-[26px] focus:outline-none"
                  placeholder="Enter Code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                />
                <PrimaryButton>Join</PrimaryButton>
              </form>
            </div>

            {/* Friends Section */}
            <div className="text-[32px] font-extrabold text-[#4e4e4e] m-0 mt-12">Friends</div>
            <div className="flex flex-wrap mt-4">
              <div
                className="h-40 flex items-center flex-col rounded-[14px] cursor-pointer select-none justify-start w-[120px]"
                onClick={() => {
                  setPopupState2(true);
                }}
              >
                <div className="rounded-full border-[6px] border-white flex items-center justify-center text-[40px] text-primary h-20 w-20 bg-white">
                  +
                </div>
                <div className="text-lg font-bold text-[#4e4e4e] m-0 mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-center">
                  Add New
                </div>
              </div>
              {friends.map((friend, idx) => (
                <div key={idx} className="h-40 flex items-center flex-col rounded-[14px] cursor-pointer select-none justify-start w-[120px] ml-4">
                  <div
                    className="flex justify-center items-center rounded-full overflow-hidden"
                    style={{
                      border: `${
                        onlineFriends.filter(
                          (e) => e._id.toString() === friend._id.toString()
                        ).length > 0
                          ? "6px solid #24eb5c"
                          : "6px solid transparent"
                      }`,
                    }}
                  >
                    <Image
                      className="w-20 h-20 rounded-full bg-[#d9d9d9] mb-4"
                      src={friend?.avatar}
                      alt={friend?.name}
                      height={80}
                      width={80}
                    />
                  </div>
                  <div className="text-lg font-bold text-[#4e4e4e] m-0 mt-2 w-full overflow-hidden whitespace-nowrap text-ellipsis text-center">
                    {friend?.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Public Rooms */}
            <div className="text-[32px] font-extrabold text-[#4e4e4e] m-0 mt-12">Public Rooms</div>
            <div className="mt-4 mb-[8vh] flex w-full flex-wrap">
              {games.map((game, idx) => (
                <div key={idx} className="flex justify-between max-w-[20vw] min-w-[16vw] p-6 bg-white rounded-[14px] mr-5 mb-5">
                  <div className="mt-1 mr-6 pr-8 mb-6">
                    <div className="text-[#4e4e4e] font-semibold text-xl">{game.code}</div>
                    <div className="mt-2">
                      {game.players.length} Players
                    </div>
                  </div>
                  <button
                    className="text-primary border-none text-sm font-semibold rounded-[10px] py-2.5 px-10 h-min cursor-pointer transition-all duration-200 bg-primary/20 hover:bg-primary/30"
                    onClick={() => {
                      router.push(`/${game.code}`);
                    }}
                  >
                    Join
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Create Game Popup */}
          <Popup
            popupState={popupState}
            ref={popupRef}
            center
            className="flex flex-col justify-between min-h-[69vh]"
          >
            <div>
              <h2 className="m-0 mb-2.5 text-[28px] font-extrabold text-primary">Create New Game</h2>
              
              {/* Visibility */}
              <div className="mt-7">
                <div className="m-0 text-lg font-bold text-[#868686]">Visibility</div>
                <div className="h-10 w-[60%] bg-primary/20 rounded-[10px] ml-[50%] -translate-x-1/2 flex mt-5">
                  <div
                    className={`w-1/2 h-full cursor-pointer flex justify-center items-center font-semibold text-primary ${
                      visibility === "public" ? "bg-primary text-white rounded-[10px]" : ""
                    }`}
                    onClick={() => setVisibility("public")}
                  >
                    <PublicIcon />
                    <div style={{ width: "5px" }} /> Public
                  </div>
                  <div
                    className={`w-1/2 h-full cursor-pointer flex justify-center items-center font-semibold text-primary ${
                      visibility === "private" ? "bg-primary text-white rounded-[10px]" : ""
                    }`}
                    onClick={() => setVisibility("private")}
                  >
                    <PrivateIcon />
                    <div style={{ width: "5px" }} />
                    Private
                  </div>
                </div>
              </div>

              {/* Player Number */}
              <div className="mt-7">
                <div className="m-0 text-lg font-bold text-[#868686]">
                  No. of Players - {playerNumber}
                </div>
                <Slider
                  axis="x"
                  xstep={0.1}
                  xmin={3}
                  xmax={8}
                  x={playerNumber}
                  styles={{
                    active: {
                      background: "#e93131",
                    },
                    track: {
                      width: "100%",
                      marginTop: "16px",
                    },
                  }}
                  onChange={({ x }) =>
                    setPlayerNumber(parseFloat(x.toFixed(0)))
                  }
                />
                <div className="text-sm font-bold text-[#868686] mt-2 w-full flex justify-between">
                  <div>3</div>
                  <div>8</div>
                </div>
              </div>

              {/* Categories */}
              <div className="mt-7">
                <div className="m-0 text-lg font-bold text-[#868686]">Categories</div>
                <div className="my-4 mb-16 flex justify-between flex-col">
                  <div className="flex mb-2.5">
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px]"
                      style={
                        categories.includes("Politics")
                          ? { background: "#0b50b8" }
                          : { background: "#0b50b826", color: "#0b50b8" }
                      }
                      onClick={() => toggleCategory("Politics")}
                    >
                      Politics
                    </div>
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px] mx-2.5"
                      style={
                        categories.includes("Sports")
                          ? { background: "#0bb850" }
                          : { background: "#0bb85026", color: "#0bb850" }
                      }
                      onClick={() => toggleCategory("Sports")}
                    >
                      Sports
                    </div>
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px]"
                      style={
                        categories.includes("Celebs")
                          ? { background: "#ee2a2a" }
                          : { background: "#ee2a2a26", color: "#ee2a2a" }
                      }
                      onClick={() => toggleCategory("Celebs")}
                    >
                      Celebs
                    </div>
                  </div>
                  <div className="flex mb-2.5">
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px]"
                      style={
                        categories.includes("Companies")
                          ? { background: "#ed9819" }
                          : { background: "#ed981926", color: "#ed9819" }
                      }
                      onClick={() => toggleCategory("Companies")}
                    >
                      Companies
                    </div>
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px] mx-2.5"
                      style={
                        categories.includes("Chats")
                          ? { background: "#d51de5" }
                          : { background: "#d51de526", color: "#d51de5" }
                      }
                      onClick={() => toggleCategory("Chats")}
                    >
                      Chats
                    </div>
                    <div
                      className="w-[100px] p-4 flex-grow text-center text-base font-bold text-white cursor-pointer select-none transition-all duration-200 rounded-[10px]"
                      style={
                        categories.includes("Random")
                          ? { background: "#f412c3" }
                          : { background: "#f412c326", color: "#f412c3" }
                      }
                      onClick={() => toggleCategory("Random")}
                    >
                      Random
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <PrimaryButton
              onClick={() => {
                const payload = {
                  private: visibility === "private",
                  maxPlayers: playerNumber,
                  categories: categories,
                };

                socket?.emit("newgame", payload);
                setPopupState(false);
              }}
            >
              Create Game
            </PrimaryButton>
          </Popup>

          {/* Add Friend Popup */}
          <Popup
            popupState={popupState2}
            ref={popupRef2}
            center
            className="flex flex-col justify-between items-center"
          >
            <h2 className="m-0 mb-2.5 text-[28px] font-extrabold text-primary self-start">Add Friend</h2>
            <div>
              <input
                className="border-[3px] border-[#d9d9d9] text-base text-[#797979] flex-grow-[0.5] py-3 px-5 pl-8 translate-y-1 mr-4 font-medium rounded-[10px] h-[26px] focus:outline-none"
                type="text"
                placeholder="Enter username"
                value={friendUsername}
                onChange={(e) => setFriendUsername(e.target.value)}
              />
              <PrimaryButton
                onClick={() => {
                  axios
                    .post("/auth/getUser", {
                      username: friendUsername,
                    })
                    .then((res) => {
                      if (res.data.success && user) {
                        setFriends([...friends, res.data.user]);
                        axios
                          .post("/auth/add-frand", {
                            userId: user._id.toString(),
                            friendId: res.data.user._id.toString(),
                          })
                          .then((res) => {
                            console.log(res.data.message);
                          });
                      }
                    });
                }}
              >
                Add Friend
              </PrimaryButton>
            </div>
          </Popup>
        </div>
      )}
    </>
  );
}
