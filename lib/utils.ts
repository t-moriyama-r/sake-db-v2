/**
 * null や undefined を除外する型ガード関数。
 * Array.prototype.filter と組み合わせて使用する。
 *
 * @example
 * const results = items.filter(isNonNullable);
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value != null;
}
