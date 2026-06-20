/**
 * サンドボックス環境の buildSearchCache Lambda を手動実行し、検索キャッシュを強制更新する
 *
 * 実行方法:
 *   npm run invoke:search-cache
 */

import { CloudFormationClient, ListStacksCommand, DescribeStackResourcesCommand } from '@aws-sdk/client-cloudformation';
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda';

const region = 'ap-northeast-1';
const cf = new CloudFormationClient({ region });
const lambda = new LambdaClient({ region });

async function getFunctionName(): Promise<string> {
  // ListStacks はページネーションを持つため全ページを取得する
  const functionStacks = [];
  let nextToken: string | undefined;
  do {
    const list = await cf.send(new ListStacksCommand({
      StackStatusFilter: ['CREATE_COMPLETE', 'UPDATE_COMPLETE'],
      NextToken: nextToken,
    }));
    const matched = list.StackSummaries?.filter(
      (s) => s.StackName?.includes('sakedbv2') && s.StackName.includes('function') && !s.StackName.includes('SearchCache'),
    ) ?? [];
    functionStacks.push(...matched);
    nextToken = list.NextToken;
  } while (nextToken);

  if (functionStacks.length === 0) {
    throw new Error('サンドボックスの function スタックが見つかりません（sandbox が起動していますか？）');
  }

  // function スタックが複数ある場合に備え、全スタックから buildSearchCache リソースを探す
  for (const stack of functionStacks) {
    const resources = await cf.send(new DescribeStackResourcesCommand({ StackName: stack.StackName! }));
    const fn = resources.StackResources?.find(
      (r) => r.LogicalResourceId?.includes('buildSearchCache') && r.ResourceType === 'AWS::Lambda::Function',
    );
    if (fn?.PhysicalResourceId) return fn.PhysicalResourceId;
  }

  throw new Error('buildSearchCache Lambda が見つかりません');
}

async function main() {
  const functionName = await getFunctionName();
  console.log(`Invoking: ${functionName}`);

  const response = await lambda.send(new InvokeCommand({ FunctionName: functionName, LogType: 'Tail' }));

  if (response.LogResult) {
    process.stdout.write(Buffer.from(response.LogResult, 'base64').toString());
  }
  if (response.FunctionError) {
    console.error(`FunctionError: ${response.FunctionError}`);
    const payload = response.Payload ? JSON.parse(Buffer.from(response.Payload).toString()) : null;
    if (payload) console.error(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  console.log('Done.');
}

main().catch((e: unknown) => {
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
  process.exit(1);
});
