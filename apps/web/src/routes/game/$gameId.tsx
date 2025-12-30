import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$gameId")({
  component: GameComponent,
});

function GameComponent() {
  const { gameId } = Route.useParams();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Game {gameId}</h1>
      <p className="mb-4">This is the game page for game ID: {gameId}</p>
      <div className="space-x-4">
        <Link
          to="/"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Back to Home
        </Link>
        <Link
          to="/game/$gameId"
          params={{ gameId: "789" }}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Go to Game 789
        </Link>
      </div>
    </div>
  );
}
