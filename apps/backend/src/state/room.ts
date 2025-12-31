export namespace Room {
  export interface Info {
    id: string;
    owner: string;
    maxPlayers: number;
    players: string[];
  }

  const internalState = {
    rooms: [] as Info[],
  };

  export function getAll(): Info[] {
    return internalState.rooms;
  }

  export function get(id: string): Info | undefined {
    return internalState.rooms.find((room) => room.id === id);
  }

  export function create(room: Info): void {
    internalState.rooms.push(room);
  }

  export function update(id: string, updatedRoom: Info): void {
    const index = internalState.rooms.findIndex((room) => room.id === id);
    if (index !== -1) {
      internalState.rooms[index] = updatedRoom;
    }
  }

  export function remove(id: string): void {
    const index = internalState.rooms.findIndex((room) => room.id === id);
    if (index !== -1) {
      internalState.rooms.splice(index, 1);
    }
  }
}
