import { GameRoom } from "../game/GameRoom";

export namespace Room {
  const rooms = new Map<string, GameRoom>();

  export function get(id: string): GameRoom | undefined {
    return rooms.get(id);
  }

  export function create(
    id: string,
    owner: string,
    maxPlayers: number
  ): GameRoom {
    const room = new GameRoom(id, owner, maxPlayers, () => rooms.delete(id));
    rooms.set(id, room);
    return room;
  }

  export function remove(id: string): void {
    rooms.delete(id);
  }

  export function getAll(): GameRoom[] {
    return Array.from(rooms.values());
  }

  export function exists(id: string): boolean {
    return rooms.has(id);
  }
}
