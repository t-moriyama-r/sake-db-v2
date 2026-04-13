import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Function as CdkFunction } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { buildSearchCache } from './functions/liquor/buildSearchCache/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  buildSearchCache,
});

// ---- 検索キャッシュ設定 ----
const { bucket } = backend.storage.resources;
const buildCacheFn = backend.buildSearchCache.resources.lambda;

// buildSearchCache に S3 書き込み権限を付与
bucket.grantWrite(buildCacheFn);
(buildCacheFn as CdkFunction).addEnvironment('STORAGE_BUCKET_NAME', bucket.bucketName);

// buildSearchCache に AppSync IAM アクセス権限を付与する
// エンドポイント・model_introspection は amplify_outputs.json をバンドルして解決するため環境変数不要
const { graphqlApi } = backend.data.resources;
buildCacheFn.addToRolePolicy(new PolicyStatement({
  effect: Effect.ALLOW,
  actions: ['appsync:GraphQL'],
  resources: [`${graphqlApi.arn}/*`],
}));

// EventBridge: 1 時間ごとにキャッシュを再構築
const scheduleStack = backend.createStack('SearchCacheScheduleStack');
new Rule(scheduleStack, 'BuildSearchCacheRule', {
  schedule: Schedule.rate(Duration.hours(1)),
  targets: [new LambdaFunction(buildCacheFn)],
});
