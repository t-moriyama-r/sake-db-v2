import type { Schema } from '../../data/resource';

/**
 * Amazon Product Advertising API からアフィリエイトデータを取得する。
 *
 * TODO: 以下の環境変数を Lambda に設定して PA-API を実装すること。
 *   - AMAZON_ASSOCIATE_TAG
 *   - AMAZON_ACCESS_KEY
 *   - AMAZON_SECRET_KEY
 */
export const handler: Schema['getAffiliateData']['functionHandler'] = async (event) => {
  const { name, limit = 10 } = event.arguments;
  console.log(`getAffiliateData: name=${name}, limit=${limit}`);
  // TODO: Amazon PA-API 呼び出し実装
  return { items: [], lowestPrice: null };
};
