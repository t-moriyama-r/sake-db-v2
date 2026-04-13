/** CACHE_ENABLED=true が設定されていない環境（開発）かどうかを返す。 */
export function isDevelopmentEnv(): boolean {
  return process.env.CACHE_ENABLED !== 'true';
}
