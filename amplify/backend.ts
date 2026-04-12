import { defineBackend } from '@aws-amplify/backend';
import { Duration } from 'aws-cdk-lib';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Function as CdkFunction } from 'aws-cdk-lib/aws-lambda';
import { auth } from './auth/resource';
import { data } from './data/resource';
import { storage } from './storage/resource';
import { buildSearchCache } from './functions/buildSearchCache/resource';
import { checkAdmin } from './functions/checkAdmin/resource';
import { getAffiliateData } from './functions/getAffiliateData/resource';
import { getFlavorMap } from './functions/getFlavorMap/resource';
import { getVoted } from './functions/getVoted/resource';
import { getRecommendLiquorList } from './functions/getRecommendLiquorList/resource';
import { randomRecommendList } from './functions/randomRecommendList/resource';
import { listFromCategory } from './functions/listFromCategory/resource';
import { searchLiquors } from './functions/searchLiquors/resource';
import { searchLiquorsByTag } from './functions/searchLiquorsByTag/resource';
import { liquorHistories } from './functions/liquorHistories/resource';
import { getUserByIdDetail } from './functions/getUserByIdDetail/resource';
import { getIsBookMarked } from './functions/getIsBookMarked/resource';
import { postFlavor } from './functions/postFlavor/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/
 */
const backend = defineBackend({
  auth,
  data,
  storage,
  // ---- Custom Lambda functions ----
  buildSearchCache,
  checkAdmin,
  getAffiliateData,
  getFlavorMap,
  getVoted,
  getRecommendLiquorList,
  randomRecommendList,
  listFromCategory,
  searchLiquors,
  searchLiquorsByTag,
  liquorHistories,
  getUserByIdDetail,
  getIsBookMarked,
  postFlavor,
});

// ---- 検索キャッシュ設定 ----
const { bucket } = backend.storage.resources;
const buildCacheFn = backend.buildSearchCache.resources.lambda;
const searchFn = backend.searchLiquors.resources.lambda;

// S3 アクセス権限付与
bucket.grantWrite(buildCacheFn);
bucket.grantRead(searchFn);

// バケット名を各 Lambda の環境変数に設定
(buildCacheFn as CdkFunction).addEnvironment('STORAGE_BUCKET_NAME', bucket.bucketName);
(searchFn as CdkFunction).addEnvironment('STORAGE_BUCKET_NAME', bucket.bucketName);

// EventBridge: 1 時間ごとにキャッシュを再構築
const scheduleStack = backend.createStack('SearchCacheScheduleStack');
new Rule(scheduleStack, 'BuildSearchCacheRule', {
  schedule: Schedule.rate(Duration.hours(1)),
  targets: [new LambdaFunction(buildCacheFn)],
});
