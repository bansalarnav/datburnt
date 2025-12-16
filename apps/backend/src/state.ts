export interface Player {
  id: string;
  socketId?: string;
  username: string;
  avatarUrl: string;
  score: number;
}

export interface Submission {
  userid: string;
  roast: string;
  votes: number;
}

export interface Vote {
  voter: string;
  vote: string;
}

export interface Round {
  image: string;
  category: string;
}

export interface Game {
  code: string;
  private: boolean;
  started: boolean;
  currentRound: number;
  maxPlayers: number;
  owner: string;
  players: Player[];
  rounds: Submission[][];
  categories: string[];
  votes: Vote[][];
  prevQs: Round[];
}

export interface State {
  games: Game[];
  sockets: Record<string, string | null>;
}

const state: State = {
  games: [
    {
      code: "xwerfe",
      private: true,
      started: false,
      currentRound: 0,
      maxPlayers: 5,
      owner: "6303ac144024b5c0ea8ef4ba",
      players: [],
      rounds: [],
      categories: ["Politics", "Sports", "Celebs"],
      votes: [],
      prevQs: [],
    },
  ],
  sockets: {},
};

export const setGames = (newGames: Game[]): void => {
  state.games = newGames;
};

export const setSockets = (newSockets: Record<string, string | null>): void => {
  state.sockets = newSockets;
};

export default state;
