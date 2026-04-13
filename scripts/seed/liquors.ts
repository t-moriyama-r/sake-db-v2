/**
 * Liquor モデル シーダー
 *
 * カテゴリ名でカテゴリ ID を解決してからお酒を登録する。
 */

import type { Schema } from '@/amplify/data/resource';
import type { DataClient, RunOptions, SeedResult, Seeder } from './runner';

type LiquorInput = {
  categoryName: string;
  name: string;
  description?: string;
  versionNo: number;
};

/** 投入するお酒データ */
const liquorData: LiquorInput[] = [
  // 日本酒
  {
    categoryName: '日本酒',
    name: '獺祭 純米大吟醸 二割三分',
    description: '山口県の旭酒造が醸す純米大吟醸。精米歩合23%まで磨き上げた米から生まれる華やかな香りと繊細な甘み。',
    versionNo: 1,
  },
  {
    categoryName: '日本酒',
    name: '久保田 萬寿',
    description: '新潟県の朝日酒造が醸す純米大吟醸。上品な甘みと繊細な旨みが調和した、久保田シリーズの最高峰。',
    versionNo: 1,
  },
  {
    categoryName: '日本酒',
    name: '八海山 特別本醸造',
    description: '新潟県の八海醸造が醸す特別本醸造。淡麗辛口でスッキリとした飲み口が特徴。',
    versionNo: 1,
  },
  {
    categoryName: '日本酒',
    name: '十四代 本丸 秘伝玉返し',
    description: '山形県の高木酒造が醸す本醸造。希少性が高く、フルーティーで甘みのある味わい。',
    versionNo: 1,
  },
  {
    categoryName: '日本酒',
    name: '醸し人九平次 純米大吟醸 EAU DU DESIR',
    description: '愛知県の萬乗醸造が醸す純米大吟醸。ワインのような香りと複雑な旨みを持つ。',
    versionNo: 1,
  },
  // ジャパニーズウイスキー
  {
    categoryName: 'ジャパニーズウイスキー',
    name: '山崎 12年',
    description: 'サントリーが手がける日本初のモルトウイスキー蒸溜所「山崎」の12年熟成品。ミズナラ樽由来の甘い香りが特徴。',
    versionNo: 1,
  },
  {
    categoryName: 'ジャパニーズウイスキー',
    name: '白州 12年',
    description: 'サントリーが手がける高原の蒸溜所「白州」の12年熟成品。爽やかなハーバルな香りとスモーキーな余韻。',
    versionNo: 1,
  },
  {
    categoryName: 'ジャパニーズウイスキー',
    name: '響 JAPANESE HARMONY',
    description: 'サントリーが誇るブレンデッドウイスキー。花や蜜のような甘い香りと滑らかな口当たり。',
    versionNo: 1,
  },
  // ビール
  {
    categoryName: 'ビール',
    name: 'サッポロ 黒ラベル',
    description: 'サッポロビールが製造するプレミアムラガー。麦の旨みとスッキリとした後味が特徴の定番ビール。',
    versionNo: 1,
  },
  {
    categoryName: 'ビール',
    name: 'アサヒ スーパードライ',
    description: 'アサヒビールの代表銘柄。辛口でキレのある味わいが特徴の日本を代表するラガービール。',
    versionNo: 1,
  },
  {
    categoryName: 'ビール',
    name: 'キリン 一番搾り',
    description: 'キリンビールが製造する、麦汁の一番搾りのみを使用したプレミアムビール。麦の旨みが凝縮されたまろやかな味わい。',
    versionNo: 1,
  },
  {
    categoryName: 'ビール',
    name: 'ヱビスビール',
    description: 'サッポロビールが製造するプレミアムビール。100%麦芽で造られたコクと旨みあふれる上質なビール。',
    versionNo: 1,
  },
  // スコッチウイスキー
  {
    categoryName: 'スペイサイド',
    name: 'ザ・グレンリベット 12年',
    description: 'スコットランド・スペイサイドを代表するシングルモルト。フルーティーで花のような甘い香りと滑らかな口当たり。',
    versionNo: 1,
  },
  {
    categoryName: 'ハイランド',
    name: 'ザ・マッカラン 12年 シェリーオーク',
    description: 'シェリー樽で熟成されたスコットランドを代表するシングルモルト。ドライフルーツのような豊かな甘みと複雑な旨み。',
    versionNo: 1,
  },
  {
    categoryName: 'アイラ',
    name: 'ラフロイグ 10年',
    description: 'アイラ島を代表するシングルモルト。強烈なスモーキーさとヨード香、海風を感じさせる個性的な味わい。',
    versionNo: 1,
  },
  // アイリッシュウイスキー
  {
    categoryName: 'アイリッシュウイスキー',
    name: 'ジェムソン スタンダード',
    description: 'アイルランドを代表するブレンデッドウイスキー。トリプルディスティレーションによる滑らかで飲みやすい味わい。',
    versionNo: 1,
  },
  // ワイン
  {
    categoryName: 'ワイン',
    name: 'シャトー・マルゴー 2015',
    description: 'ボルドー・メドック格付け第1級。エレガントで複雑な香りと繊細なタンニンを持つフランスを代表する赤ワイン。',
    versionNo: 1,
  },
  {
    categoryName: 'ワイン',
    name: 'モエ・エ・シャンドン ブリュット アンペリアル',
    description: 'フランスを代表するシャンパーニュハウスの定番シャンパン。フレッシュな果実味と上品な泡立ちが特徴。',
    versionNo: 1,
  },
  // 混成酒(リキュール)
  {
    categoryName: '混成酒(リキュール)',
    name: 'カンパリ',
    description: 'イタリア生まれの苦みが特徴のリキュール。鮮やかな赤色とハーブの香りで、カンパリソーダやネグローニに使われる。',
    versionNo: 1,
  },
  {
    categoryName: '混成酒(リキュール)',
    name: 'コアントロー',
    description: 'フランス産のオレンジリキュール。甘くフルーティーな香りで、カクテルのベースとして世界中で愛用される。',
    versionNo: 1,
  },
  // ラム
  {
    categoryName: 'ラム',
    name: 'バカルディ スペリオール',
    description: 'キューバ発祥のホワイトラム。軽やかでクリーンな味わいでモヒートやダイキリに最適。',
    versionNo: 1,
  },
];

async function fetchAllCategories(
  client: DataClient,
): Promise<Map<string, { id: string; name: string }>> {
  const map = new Map<string, { id: string; name: string }>();
  let nextToken: string | null | undefined = undefined;

  do {
    const result = await client.models.Category.list({ limit: 500, nextToken });
    if (result.errors?.length) {
      console.warn('カテゴリ取得中にエラーが発生しました:', result.errors);
      break;
    }
    for (const c of result.data) {
      map.set(c.name, { id: c.id, name: c.name });
    }
    nextToken = result.nextToken as string | null | undefined;
  } while (nextToken);

  return map;
}

async function fetchAllLiquors(
  client: DataClient,
): Promise<Map<string, string>> {
  const map = new Map<string, string>(); // `name:categoryId` → id
  let nextToken: string | null | undefined = undefined;

  do {
    const result = await client.models.Liquor.list({ limit: 500, nextToken });
    if (result.errors?.length) {
      console.warn('Liquor 取得中にエラーが発生しました:', result.errors);
      break;
    }
    for (const l of result.data) {
      map.set(`${l.name}:${l.categoryId}`, l.id);
    }
    nextToken = result.nextToken as string | null | undefined;
  } while (nextToken);

  return map;
}

export const liquorsSeeder: Seeder = {
  modelName: 'Liquor',

  async run(client: DataClient, options: RunOptions): Promise<SeedResult> {
    const result: SeedResult = { created: 0, skipped: 0, failed: 0 };

    const categoryMap = await fetchAllCategories(client);
    const existingMap = await fetchAllLiquors(client);

    for (const item of liquorData) {
      const category = categoryMap.get(item.categoryName);
      if (!category) {
        console.warn(`  ✗ カテゴリが見つかりません: ${item.categoryName} (${item.name} をスキップ)`);
        result.failed++;
        continue;
      }

      const key = `${item.name}:${category.id}`;
      const label = `${item.name} [${item.categoryName}]`;

      if (existingMap.has(key)) {
        console.log(`  - スキップ  ${label}`);
        result.skipped++;
        continue;
      }

      if (options.dryRun) {
        console.log(`  (dry) 作成予定  ${label}`);
        result.created++;
        continue;
      }

      const { data, errors } = await client.models.Liquor.create({
        categoryId: category.id,
        categoryName: category.name,
        name: item.name,
        description: item.description,
        versionNo: item.versionNo,
        rate5Users: [],
        rate4Users: [],
        rate3Users: [],
        rate2Users: [],
        rate1Users: [],
      });

      if (errors?.length || !data) {
        console.error(`  ✗ 失敗  ${label}`);
        for (const e of errors ?? []) console.error(`    →`, e.message);
        result.failed++;
        continue;
      }

      existingMap.set(key, data.id);
      console.log(`  ✓ 作成  ${label}  → ${data.id}`);
      result.created++;
    }

    return result;
  },
};
