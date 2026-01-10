import type { Player } from "./player";

export class Game {
  private id: string;
  private owner: string;
  private maxPlayers: number;
  private players: Map<string, Player.Info>;
  private createdAt: Date;
  private cleanupTimer: Timer | null = null;
  private deleteGame: () => void;

  constructor(
    id: string,
    owner: string,
    maxPlayers: number,
    deleteGame: () => void
  ) {
    this.id = id;
    this.owner = owner;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.createdAt = new Date();
    this.deleteGame = deleteGame;

    this.scheduleCleanup();
  }

  addPlayer(ws: Player.WebSocketLike, user: Player.Data): Player.JoinResult {
    const validation = this.canJoin(user.id);
    if (!validation.canJoin) {
      return { success: false, error: validation.reason };
    }

    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    const existingPlayer = this.players.get(user.id);

    if (existingPlayer) {
      existingPlayer.connected = true;
      existingPlayer.ws = ws;
      existingPlayer.name = user.name;
      existingPlayer.avatar = user.avatar;
    } else {
      const newPlayer: Player.Info = {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        connected: true,
        ws: ws,
      };
      this.players.set(user.id, newPlayer);
    }

    ws.send(
      JSON.stringify({
        type: "game_info",
        data: this.toJSON(),
      })
    );

    this.broadcast(
      {
        type: "player_joined",
        data: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          connected: true,
        },
      },
      user.id
    );

    return { success: true };
  }

  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.connected = false;
    player.ws = null;

    this.broadcast({
      type: "player_disconnected",
      data: { playerId },
    });

    this.scheduleCleanup();
  }

  kickPlayer(playerId: string, kickerId: string): Player.JoinResult {
    if (kickerId !== this.owner) {
      return { success: false, error: "Only the owner can kick players" };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    if (player.ws) {
      player.ws.close();
    }

    this.players.delete(playerId);

    this.broadcast({
      type: "player_kicked",
      data: { playerId },
    });

    this.scheduleCleanup();

    return { success: true };
  }

  getPlayer(playerId: string): Player.Info | undefined {
    return this.players.get(playerId);
  }

  isFull(): boolean {
    const connectedCount = Array.from(this.players.values()).filter(
      (p) => p.connected
    ).length;
    return connectedCount >= this.maxPlayers;
  }

  canJoin(userId: string): { canJoin: boolean; reason?: string } {
    const existingPlayer = this.players.get(userId);

    if (existingPlayer?.connected) {
      return { canJoin: false, reason: "Player already in game" };
    }

    if (userId === this.owner) {
      return { canJoin: true };
    }

    const connectedCount = Array.from(this.players.values()).filter(
      (p) => p.connected
    ).length;

    const ownerPlayer = this.players.get(this.owner);
    const ownerInGame = ownerPlayer?.connected === true;

    const effectiveMax = ownerInGame ? this.maxPlayers : this.maxPlayers - 1;

    if (connectedCount < effectiveMax) {
      return { canJoin: true };
    }

    return { canJoin: false, reason: "Game is full" };
  }

  broadcast(message: object, excludePlayerId?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [playerId, player] of this.players.entries()) {
      if (player.connected && player.ws && playerId !== excludePlayerId) {
        player.ws.send(messageStr);
      }
    }
  }

  private scheduleCleanup(): void {
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    const allDisconnected = Array.from(this.players.values()).every(
      (p) => !p.connected
    );

    if (allDisconnected) {
      this.cleanupTimer = setTimeout(
        () => {
          console.log(`Deleting inactive game: ${this.id}`);
          this.deleteGame();
        },
        5 * 60 * 1000
      ); // 5 minutes
    }
  }

  toJSON() {
    const players: Player.Data[] = Array.from(
      this.players.values().filter((p) => p.connected)
    ).map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
    }));

    return {
      id: this.id,
      owner: this.owner,
      maxPlayers: this.maxPlayers,
      players,
      createdAt: this.createdAt,
    };
  }
}
