import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  loader: () => {
    console.log("index loader");
  },
  component: App,
});

function App() {
  return (
    <div className="">
      <Link to="/game/$roomId" params={{ roomId: "123" }}>
        Go to /game/123
      </Link>
    </div>
  );
}
