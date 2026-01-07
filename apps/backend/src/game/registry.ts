import { Game } from "./index";

export namespace GameRegistry {
  const games = new Map<string, Game>();

  export function get(id: string): Game | undefined {
    return games.get(id);
  }

  export function create(id: string, owner: string, maxPlayers: number): Game {
    const game = new Game(id, owner, maxPlayers, () => games.delete(id));
    games.set(id, game);
    return game;
  }

  export function remove(id: string): void {
    games.delete(id);
  }

  export function getAll(): Game[] {
    return Array.from(games.values());
  }

  export function exists(id: string): boolean {
    return games.has(id);
  }
}
