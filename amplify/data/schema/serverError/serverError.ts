import { a } from '@aws-amplify/backend';

/** サーバーエラーの重要度 */
const ServerErrorSeverity = a.enum(['DEBUG', 'INFO', 'WARN', 'ERROR', 'CRITICAL']);

/**
 * サーバーエラーログ
 *
 * - 管理者のみ参照可能
 * - サーバーサイドから apiKey で書き込む
 */
export const serverErrorModels = {
  ServerError: a
    .model({
      /** エラーが発生した場所（例: "app/api/liquor/route.ts", "actions/submitComment"） */
      location: a.string().required(),
      /** エラーメッセージ */
      message: a.string().required(),
      /** スタックトレース（任意） */
      stack: a.string(),
      /** 発生時のユーザーID（未ログイン時は null） */
      userId: a.string(),
      /** 重要度 */
      severity: a.ref('ServerErrorSeverity').required(),
      /** 追加コンテキスト情報（JSON文字列として保存） */
      context: a.string(),
    })
    .authorization((allow) => [
      allow.groups(['admin']).to(['read']),
      allow.publicApiKey().to(['create']),
    ]),
  ServerErrorSeverity,
};
