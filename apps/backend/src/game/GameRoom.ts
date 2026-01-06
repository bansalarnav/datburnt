import type { JoinResult, Player, PlayerWithWS, WebSocketLike } from "./types";

export class GameRoom {
  private id: string;
  private owner: string;
  private maxPlayers: number;
  private players: Map<string, PlayerWithWS>;
  private createdAt: Date;
  private cleanupTimer: Timer | null = null;
  private deleteRoom: () => void;

  constructor(
    id: string,
    owner: string,
    maxPlayers: number,
    deleteRoom: () => void
  ) {
    this.id = id;
    this.owner = owner;
    this.maxPlayers = maxPlayers;
    this.players = new Map();
    this.createdAt = new Date();
    this.deleteRoom = deleteRoom;
  }

  addPlayer(ws: WebSocketLike, user: Player): JoinResult {
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
      const newPlayer: PlayerWithWS = {
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

  /**
   * Mark a player as disconnected (doesn't remove them from the room)
   */
  removePlayer(playerId: string): void {
    const player = this.players.get(playerId);
    if (!player) return;

    player.connected = false;
    player.ws = null;

    this.broadcast({
      type: "player_disconnected",
      data: { playerId },
    });

    // Schedule cleanup if this was the last connected player
    this.scheduleCleanup();
  }

  /**
   * Kick a player from the room (removes them completely)
   */
  kickPlayer(playerId: string, kickerId: string): JoinResult {
    // Validate that the kicker is the owner
    if (kickerId !== this.owner) {
      return { success: false, error: "Only the owner can kick players" };
    }

    const player = this.players.get(playerId);
    if (!player) {
      return { success: false, error: "Player not found" };
    }

    // Close the player's WebSocket connection
    if (player.ws) {
      player.ws.close();
    }

    // Remove player from the room completely
    this.players.delete(playerId);

    this.broadcast({
      type: "player_kicked",
      data: { playerId },
    });

    // Schedule cleanup if this was the last connected player
    this.scheduleCleanup();

    return { success: true };
  }

  getPlayer(playerId: string): PlayerWithWS | undefined {
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
      return { canJoin: false, reason: "Player already in room" };
    }

    if (userId === this.owner) {
      return { canJoin: true };
    }

    const connectedCount = Array.from(this.players.values()).filter(
      (p) => p.connected
    ).length;

    const ownerPlayer = this.players.get(this.owner);
    const ownerInRoom = ownerPlayer?.connected === true;

    const effectiveMax = ownerInRoom ? this.maxPlayers : this.maxPlayers - 1;

    if (connectedCount < effectiveMax) {
      return { canJoin: true };
    }

    return { canJoin: false, reason: "Room is full" };
  }

  broadcast(message: object, excludePlayerId?: string): void {
    const messageStr = JSON.stringify(message);

    for (const [playerId, player] of this.players.entries()) {
      if (player.connected && player.ws && playerId !== excludePlayerId) {
        player.ws.send(messageStr);
      }
    }
  }

  /**
   * Schedule cleanup if all players are disconnected
   */
  private scheduleCleanup(): void {
    // Clear any existing timer
    if (this.cleanupTimer) {
      clearTimeout(this.cleanupTimer);
      this.cleanupTimer = null;
    }

    // Check if all players are disconnected
    const allDisconnected = Array.from(this.players.values()).every(
      (p) => !p.connected
    );

    if (allDisconnected) {
      // Start 5-minute countdown to deletion
      this.cleanupTimer = setTimeout(
        () => {
          console.log(`Deleting inactive room: ${this.id}`);
          this.deleteRoom();
        },
        5 * 60 * 1000
      ); // 5 minutes
    }
  }

  toJSON() {
    const players: Player[] = Array.from(this.players.values()).map((p) => ({
      id: p.id,
      name: p.name,
      avatar: p.avatar,
      connected: p.connected,
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
