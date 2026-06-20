/** Reads a required environment variable, failing fast when it is absent. */
export function requireEnv(key: string): string {
  const value = process.env[key]
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

/** Reads an optional environment variable with a fallback. */
export function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key]
  return value === undefined || value === '' ? fallback : value
}
