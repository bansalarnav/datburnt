import { TanStackDevtools } from "@tanstack/react-devtools";
import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import type { User } from "../state/user";
import { AuthProvider } from "../state/user";
import appCss from "../styles.css?url";
import { apiClient } from "../utils/apiClient";

interface RouterContext {
  queryClient: QueryClient;
}

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
  ssr: false,
  beforeLoad: async ({ context }: { context: RouterContext }) => {
    const user = await context.queryClient.fetchQuery({
      queryKey: ["user"],
      queryFn: async () => {
        try {
          const response = await apiClient.get<{
            success: boolean;
            user: User;
          }>("/user/me");
          if (response.data.success) {
            return response.data.user;
          }
          return null;
        } catch {
          return null;
        }
      },
    });

    return { user };
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
  const { user } = Route.useRouteContext();

  return (
    <AuthProvider initialUser={user}>
      <Outlet />
    </AuthProvider>
  );
}
