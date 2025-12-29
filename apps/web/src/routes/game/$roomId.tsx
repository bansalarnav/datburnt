import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/game/$roomId")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/game/$roomId"!</div>;
}
