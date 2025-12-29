import { TanStackDevtools } from "@tanstack/react-devtools";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import appCss from "../styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Datburnt",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),
  ssr: "data-only",
  staleTime: Infinity,
  shouldReload: false,
  beforeLoad: async () => {
    console.log("loader ran");
    await new Promise((resolve, _reject) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
    console.log("loader finished");
    return { name: "hello" };
  },
  shellComponent: RootDocument,
  component: RootComponent,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  console.log("where is this rendered");
  const { name } = Route.useRouteContext();

  return (
    <div>
      <h1>This component will be rendered on the client {name}</h1>
      <Outlet />
    </div>
  );
}
