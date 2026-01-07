import { z } from "zod";

export namespace Player {
  export const Data = z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string(),
  });
  export type Data = z.infer<typeof Data>;

  export interface WebSocketLike {
    send(message: string): void;
    close(): void;
  }

  export interface Info extends Data {
    ws: WebSocketLike | null;
    connected: boolean;
  }

  export const JoinResult = z.object({
    success: z.boolean(),
    error: z.string().optional(),
  });

  export type JoinResult = z.infer<typeof JoinResult>;
}
