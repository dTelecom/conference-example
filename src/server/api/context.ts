import type {CreateNextContextOptions} from "@trpc/server/src/adapters/next"
import requestIp from "request-ip"
import type {inferAsyncReturnType} from "@trpc/server"
/**
 * Creates context for an incoming request
 * @link https://trpc.io/docs/context
 */
export function createContext(opts: CreateNextContextOptions) {
  const ip = requestIp.getClientIp(opts.req)

  return {
    ip: ip || undefined,
  };
}

export type Context = inferAsyncReturnType<typeof createContext>;
