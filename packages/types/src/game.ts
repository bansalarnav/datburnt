import { z } from "zod";

// ============================================================================
// Player Types
// ============================================================================

export const Player = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  connected: z.boolean().optional().default(true),
});
export type Player = z.infer<typeof Player>;

// ============================================================================
// Game Types
// ============================================================================

export const GameStatus = z.enum(["lobby", "playing", "finished"]);
export type GameStatus = z.infer<typeof GameStatus>;

export const GameInfo = z.object({
  id: z.string(),
  owner: z.string(),
  maxPlayers: z.number(),
  numRounds: z.number(),
  collections: z.array(z.string()),
  createdAt: z.string(),
});
export type GameInfo = z.infer<typeof GameInfo>;

// ============================================================================
// WebSocket Events - Server to Client
// ============================================================================

export const ServerGameInfoEvent = z.object({
  type: z.literal("game_info"),
  data: GameInfo.extend({
    players: z.array(Player),
    status: GameStatus,
  }),
});
export type ServerGameInfoEvent = z.infer<typeof ServerGameInfoEvent>;

export const ServerPlayerJoinedEvent = z.object({
  type: z.literal("player_joined"),
  data: Player,
});
export type ServerPlayerJoinedEvent = z.infer<typeof ServerPlayerJoinedEvent>;

export const ServerPlayerDisconnectedEvent = z.object({
  type: z.literal("player_disconnected"),
  data: z.object({
    playerId: z.string(),
  }),
});
export type ServerPlayerDisconnectedEvent = z.infer<
  typeof ServerPlayerDisconnectedEvent
>;

export const ServerPlayerKickedEvent = z.object({
  type: z.literal("player_kicked"),
  data: z.object({
    playerId: z.string(),
  }),
});
export type ServerPlayerKickedEvent = z.infer<typeof ServerPlayerKickedEvent>;

export const ServerGameStartedEvent = z.object({
  type: z.literal("game_started"),
});
export type ServerGameStartedEvent = z.infer<typeof ServerGameStartedEvent>;

export const ServerErrorEvent = z.object({
  type: z.literal("error"),
  message: z.string(),
});
export type ServerErrorEvent = z.infer<typeof ServerErrorEvent>;

// Union of all server events
export const ServerGameEvent = z.discriminatedUnion("type", [
  ServerGameInfoEvent,
  ServerPlayerJoinedEvent,
  ServerPlayerDisconnectedEvent,
  ServerPlayerKickedEvent,
  ServerGameStartedEvent,
  ServerErrorEvent,
]);
export type ServerGameEvent = z.infer<typeof ServerGameEvent>;

// ============================================================================
// WebSocket Events - Client to Server
// ============================================================================

export const ClientKickPlayerEvent = z.object({
  type: z.literal("kick_player"),
  playerId: z.string(),
});
export type ClientKickPlayerEvent = z.infer<typeof ClientKickPlayerEvent>;

export const ClientStartGameEvent = z.object({
  type: z.literal("start_game"),
});
export type ClientStartGameEvent = z.infer<typeof ClientStartGameEvent>;

// Union of all client events
export const ClientGameEvent = z.discriminatedUnion("type", [
  ClientKickPlayerEvent,
  ClientStartGameEvent,
]);
export type ClientGameEvent = z.infer<typeof ClientGameEvent>;
