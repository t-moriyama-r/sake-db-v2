import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const outputs = require('@/amplify_outputs.json');
Amplify.configure(outputs, { ssr: true });

type Severity = Schema['ServerErrorSeverity']['type'];

type LogServerErrorInput = {
  location: string;
  message: string;
  stack?: string;
  userId?: string;
  severity: Severity;
  context?: Record<string, unknown>;
};

/**
 * サーバーエラーをデータベースに記録する。
 * エラーハンドリングは内部で行い、ロギング自体の失敗はコンソールに出力するのみとする。
 */
export async function logServerError(input: LogServerErrorInput): Promise<void> {
  try {
    const client = generateClient<Schema>({ authMode: 'apiKey' });

    await client.models.ServerError.create({
      location: input.location,
      message: input.message,
      stack: input.stack,
      userId: input.userId,
      severity: input.severity,
      context: input.context !== undefined ? JSON.stringify(input.context) : undefined,
    });
  } catch (e: unknown) {
    console.error('サーバーエラーのログ記録に失敗しました:', e instanceof Error ? e.message : String(e));
  }
}
