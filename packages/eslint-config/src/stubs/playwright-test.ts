/** Minimal stub so playwright.config.ts can be evaluated without loading real Playwright. */
export function defineConfig<T>(config: T): T {
  return config
}

export const devices = new Proxy(
  {} as Record<string, Record<string, unknown>>,
  {
    get: () => ({}),
  },
)
