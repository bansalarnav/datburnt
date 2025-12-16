import { ServerWebSocket } from 'bun';
import makeid from '../utils/makeid';
import state, { setGames } from '../state';
import { parse } from 'cookie';
import jwt from 'jsonwebtoken';
import UserModel, { type User } from '../models/User';

interface WebSocketData {
  user?: User;
}

function sortGames(games: typeof state.games) {
  return games.filter(game => !game.private && !game.started);
}

export function setupHomeWebSocket(ws: ServerWebSocket<WebSocketData>, message: string) {
  const data = JSON.parse(message);
  
  if (data.type === 'newgame') {
    const code = makeid(6);
    const newGame = {
      ...data.payload,
      players: [],
      started: false,
      currentRound: 0,
      rounds: [],
      votes: [],
      code,
      owner: ws.data.user?.id || '',
      prevQs: [],
    };

    setGames([...state.games, newGame]);
    
    ws.send(JSON.stringify({ type: 'games', games: sortGames(state.games) }));
    ws.send(JSON.stringify({ type: 'redirect', code }));
    
    console.log(`Creating new game ${code}`);
    console.log('No. of Rooms:', state.games.length);
  }
}

export function setupHomeWebSocketConnection(ws: ServerWebSocket<WebSocketData>) {
  ws.send(JSON.stringify({ type: 'games', games: sortGames(state.games) }));
}

export async function authenticateWebSocket(headers: Headers): Promise<User | null> {
  const cookieHeader = headers.get('cookie');
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  const token = cookies.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY!) as { id: string };
    const user = await UserModel.findOne({ id: decoded.id });
    return user;
  } catch (e) {
    return null;
  }
}
