export interface Player {
  id: string;
  name: string;
  avatar: string;
  connected: boolean;
}

export interface WebSocketLike {
  send(message: string): void;
  close(): void;
}

export interface PlayerWithWS extends Player {
  ws: WebSocketLike | null;
}

export interface JoinResult {
  success: boolean;
  error?: string;
}
