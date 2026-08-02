import { type AttributeValue, DynamoDBClient, ScanCommand } from '@aws-sdk/client-dynamodb';
import { unmarshall } from '@aws-sdk/util-dynamodb';

const dynamo = new DynamoDBClient();

/**
 * ランダムなお酒リストを返す。
 * DynamoDB はランダム取得を直接サポートしないため、全件取得後にシャッフルする。
 * データ量が増えたら OpenSearch や ElastiCache への移行を検討すること。
 *
 * allow.resource() が @aws-amplify/data-schema@1.x に存在しないため
 * Amplify データクライアントを使わず DynamoDB SDK で直接アクセスする。
 * backend.ts で grantReadData と LIQUOR_TABLE_NAME 環境変数を付与済み。
 */
export const handler = async (event: { arguments: { limit: number } }) => {
  const { limit } = event.arguments;
  const tableName = process.env.LIQUOR_TABLE_NAME;
  if (!tableName) {
    console.warn('LIQUOR_TABLE_NAME 環境変数が設定されていません');
    return JSON.stringify([]);
  }

  const items: Record<string, unknown>[] = [];
  let lastKey: Record<string, AttributeValue> | undefined;

  do {
    const result = await dynamo.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
      }),
    );
    (result.Items ?? []).forEach((item) => items.push(unmarshall(item)));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  if (items.length === 0) return JSON.stringify([]);

  // Fisher-Yates シャッフル
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }

  return JSON.stringify(items.slice(0, limit));
};
