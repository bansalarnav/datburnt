import type { ServerWebSocket } from "bun";
import { parse } from "cookie";
import jwt from "jsonwebtoken";
import UserModel, { type User } from "../models/User";
import state, { type Game, setGames, setSockets } from "../state";

interface WebSocketData {
  user?: User;
}

function findGame(code: string): Game | undefined {
  return state.games.find((game) => game.code === code);
}

const images = [
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1015302933526622318/unknown.png?width=638&height=586",
    category: "Politics",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015909432254808104/unknown.png",
    category: "Politics",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015909608520437800/unknown.png",
    category: "Politics",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015909737495269376/unknown.png",
    category: "Politics",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015910009428787200/unknown.png",
    category: "Politics",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015910704856973392/unknown.png",
    category: "Sports",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015911232563322890/unknown.png",
    category: "Sports",
  },
  {
    url: "https://cdn.discordapp.com/attachments/896998944935120907/1015911668057903124/unknown.png",
    category: "Sports",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016290324919877652/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016290500615090206/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016290677165932564/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016290893520719932/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016291675875844137/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016291733262303323/unknown.png",
    category: "Celebs",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016292558864916550/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016292780642943046/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016293192301297764/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016293399348924516/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016293843399884830/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016293883832979496/unknown.png",
    category: "Random",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016294272384892948/unknown.png",
    category: "Random",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016294352135409716/unknown.png",
    category: "Companies",
  },
  {
    url: "https://media.discordapp.net/attachments/772689583019393084/1016296668334919760/unknown.png",
    category: "Celebs",
  },
];

function getRound(
  _categories: string[],
  previousRounds: { image: string; category: string }[]
) {
  let foundUnique = false;
  let ques: { url: string; category: string } | undefined;

  while (!foundUnique) {
    const index = Math.floor(Math.random() * images.length);
    const q = images[index];

    if (previousRounds.filter((p) => p.image === q.url).length === 0) {
      foundUnique = true;
      ques = q;
    }
  }

  return {
    image: ques?.url,
    category: ques?.category,
  };
}

function updateGame(code: string, newGame: Game) {
  const index = state.games.findIndex((game) => game.code === code);
  const games = [...state.games];
  games[index] = newGame;

  setGames(games);
}

export async function authenticateGameWebSocket(
  headers: Headers
): Promise<User | null> {
  const cookieHeader = headers.get("cookie");
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as { id: string };
    const user = await UserModel.findOne({ id: decoded.id });
    return user;
  } catch (_e) {
    return null;
  }
}

export function setupGameWebSocket(
  ws: ServerWebSocket<WebSocketData>,
  message: string,
  socketId: string
) {
  const data = JSON.parse(message);

  if (data.type === "disconnect") {
    const code = state.sockets[socketId];

    if (code) {
      const game = findGame(code);
      if (game) {
        const index = game.players.findIndex(
          (p) => p.id === ws.data.user?.id && p.socketId === socketId
        );

        if (index >= 0) {
          game.players.splice(index, 1);
          console.log(
            `${socketId} left room ${code}. ${game.players.length} Players left in room`
          );
          updateGame(code, game);
          setSockets({ ...state.sockets, [socketId]: null });

          if (game.players.length <= 0) {
            const gameIndex = state.games.findIndex((g) => g.code === code);
            const gs = [...state.games];
            gs.splice(gameIndex, 1);
            setGames(gs);
            setSockets({ ...state.sockets, [socketId]: null });
            console.log("Deleting Room:", code);
            console.log("No. of Rooms Now:", gs.length);
          }
        }
      }
    }
  }

  if (data.type === "join-game") {
    const code = data.code;
    const game = findGame(code);

    if (!game) {
      ws.send(
        JSON.stringify({
          type: "game-details",
          success: false,
          message: "Game not Found",
        })
      );
    } else {
      if (game.started) {
        ws.send(
          JSON.stringify({
            type: "game-details",
            success: false,
            message: "Game has already started",
          })
        );
      } else if (game.players.length >= game.maxPlayers) {
        ws.send(
          JSON.stringify({
            type: "game-details",
            success: false,
            message: "Game is full",
          })
        );
      } else if (game.players.find((p) => p.id === ws.data.user?.id)) {
        ws.send(
          JSON.stringify({
            type: "game-details",
            success: false,
            message: "You have already joined this game",
          })
        );
      } else {
        const newGame = {
          ...game,
          players: [
            {
              id: ws.data.user?.id,
              socketId: socketId,
              username: ws.data.user?.name,
              avatarUrl: ws.data.user?.avatar,
              score: 0,
            },
            ...game.players,
          ],
        };

        updateGame(code, newGame);
        setSockets({ ...state.sockets, [socketId]: code });

        ws.send(
          JSON.stringify({
            type: "game-details",
            success: true,
            game: {
              ...newGame,
              rounds: null,
              votes: null,
            },
          })
        );
      }
    }
  }

  if (data.type === "start") {
    const code = data.code;
    const game = findGame(code);

    if (game && game.owner === ws.data.user?.id && game.players.length >= 3) {
      const round = getRound(game.categories, game.prevQs);
      const newGame = {
        ...game,
        started: true,
        currentRound: 1,
        prevQs: [...game.prevQs, round],
      };
      updateGame(code, newGame);
    }
  }

  if (data.type === "submit") {
    const { code, roast } = data;
    const game = findGame(code);

    if (game) {
      if (!game.rounds[game.currentRound]) {
        game.rounds[game.currentRound] = [];
      }

      const hasSubmitted = game.rounds[game.currentRound].find(
        (sub) => sub.userid === ws.data.user?.id
      );

      if (!hasSubmitted) {
        game.rounds[game.currentRound].push({
          userid: ws.data.user?.id,
          roast,
          votes: 0,
        });
        updateGame(code, game);
      }
    }
  }

  if (data.type === "vote") {
    const { code, vote } = data;
    const game = findGame(code);

    if (game) {
      if (!game.votes[game.currentRound]) {
        game.votes[game.currentRound] = [];
      }

      const hasVoted = game.votes[game.currentRound].find(
        (v) => v.voter === ws.data.user?.id
      );

      if (!hasVoted) {
        game.votes[game.currentRound].push({
          voter: ws.data.user?.id,
          vote: vote,
        });
        updateGame(code, game);

        if (game.votes[game.currentRound].length >= game.players.length) {
          const voters: string[] = [];
          game.votes[game.currentRound].forEach((v) => {
            if (v.vote.replaceAll(" ", "").trim().length > 0) {
              voters.push(v.voter);
            }
          });
          game.votes[game.currentRound].forEach((v) => {
            if (voters.includes(v.vote)) {
              const i = game.players.findIndex((p) => p.id === v.vote);
              const playerToIncreaseScore = { ...game.players[i] };
              playerToIncreaseScore.score += 50;
              game.players[i] = playerToIncreaseScore;
            }
          });

          updateGame(code, game);
        }
      }
    }
  }

  if (data.type === "next-round") {
    const code = data.code;
    const game = findGame(code);

    if (game && game.owner === ws.data.user?.id) {
      const nextRound = game.currentRound + 1;

      if (nextRound > 5) {
        const _winners = game.players.sort((a, b) => {
          return -(a.score - b.score);
        });
      } else {
        const round = getRound(game.categories, game.prevQs);
        const newGame = {
          ...game,
          started: true,
          currentRound: nextRound,
          prevQs: [...game.prevQs, round],
        };
        updateGame(code, newGame);
      }
    }
  }

  if (data.type === "end") {
    const code = data.code;
    const gameIndex = state.games.findIndex((g) => g.code === code);
    const gs = [...state.games];
    gs.splice(gameIndex, 1);
    setGames(gs);
    setSockets({ ...state.sockets, [socketId]: null });
  }

  if (data.type === "remove-player") {
    const { code, id } = data;
    const game = findGame(code);

    if (game && game.owner === ws.data.user?.id) {
      const i = game.players.findIndex((p) => p.id === id);
      const playerToRemove = game.players[i];
      if (playerToRemove?.socketId) {
        const newPlayers = [...game.players];
        newPlayers.splice(i, 1);
        game.players = newPlayers;
        updateGame(code, game);
      }
    }
  }
}
