/**
 * Liquor モデル シーダー
 *
 * categories.ts の CATEGORIES 定数から固定 ID でカテゴリを解決する。
 * DB からカテゴリを名前検索しないため、「その他」のような同名カテゴリでも衝突しない。
 *
 * 前提: categories シーダーで固定 ID のカテゴリが作成済みであること。
 *       旧 ID（自動生成）のカテゴリが残っている場合は削除して再シードすること。
 */

import type { DataClient, RunOptions, SeedResult, Seeder } from './runner';
import { CATEGORIES } from './categories';

type CategoryKey = keyof typeof CATEGORIES;

type LiquorInput = {
  categoryKey: CategoryKey;
  name: string;
  description?: string;
  versionNo: number;
};

/** 投入するお酒データ */
const liquorData: LiquorInput[] = [
  // 日本酒
  {
    categoryKey: '日本酒',
    name: '獺祭 純米大吟醸 二割三分',
    description: '山口県の旭酒造が醸す純米大吟醸。精米歩合23%まで磨き上げた米から生まれる華やかな香りと繊細な甘み。',
    versionNo: 1,
  },
  {
    categoryKey: '日本酒',
    name: '久保田 萬寿',
    description: '新潟県の朝日酒造が醸す純米大吟醸。上品な甘みと繊細な旨みが調和した、久保田シリーズの最高峰。',
    versionNo: 1,
  },
  {
    categoryKey: '日本酒',
    name: '八海山 特別本醸造',
    description: '新潟県の八海醸造が醸す特別本醸造。淡麗辛口でスッキリとした飲み口が特徴。',
    versionNo: 1,
  },
  {
    categoryKey: '日本酒',
    name: '十四代 本丸 秘伝玉返し',
    description: '山形県の高木酒造が醸す本醸造。希少性が高く、フルーティーで甘みのある味わい。',
    versionNo: 1,
  },
  {
    categoryKey: '日本酒',
    name: '醸し人九平次 純米大吟醸 EAU DU DESIR',
    description: '愛知県の萬乗醸造が醸す純米大吟醸。ワインのような香りと複雑な旨みを持つ。',
    versionNo: 1,
  },
  // ジャパニーズウイスキー
  {
    categoryKey: 'ジャパニーズウイスキー',
    name: '山崎 12年',
    description: 'サントリーが手がける日本初のモルトウイスキー蒸溜所「山崎」の12年熟成品。ミズナラ樽由来の甘い香りが特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'ジャパニーズウイスキー',
    name: '白州 12年',
    description: 'サントリーが手がける高原の蒸溜所「白州」の12年熟成品。爽やかなハーバルな香りとスモーキーな余韻。',
    versionNo: 1,
  },
  {
    categoryKey: 'ジャパニーズウイスキー',
    name: '響 JAPANESE HARMONY',
    description: 'サントリーが誇るブレンデッドウイスキー。花や蜜のような甘い香りと滑らかな口当たり。',
    versionNo: 1,
  },
  // ビール
  {
    categoryKey: 'ビール',
    name: 'サッポロ 黒ラベル',
    description: 'サッポロビールが製造するプレミアムラガー。麦の旨みとスッキリとした後味が特徴の定番ビール。',
    versionNo: 1,
  },
  {
    categoryKey: 'ビール',
    name: 'アサヒ スーパードライ',
    description: 'アサヒビールの代表銘柄。辛口でキレのある味わいが特徴の日本を代表するラガービール。',
    versionNo: 1,
  },
  {
    categoryKey: 'ビール',
    name: 'キリン 一番搾り',
    description: 'キリンビールが製造する、麦汁の一番搾りのみを使用したプレミアムビール。麦の旨みが凝縮されたまろやかな味わい。',
    versionNo: 1,
  },
  {
    categoryKey: 'ビール',
    name: 'ヱビスビール',
    description: 'サッポロビールが製造するプレミアムビール。100%麦芽で造られたコクと旨みあふれる上質なビール。',
    versionNo: 1,
  },
  // スコッチウイスキー
  {
    categoryKey: 'スペイサイド',
    name: 'ザ・グレンリベット 12年',
    description: 'スコットランド・スペイサイドを代表するシングルモルト。フルーティーで花のような甘い香りと滑らかな口当たり。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハイランド',
    name: 'ザ・マッカラン 12年 シェリーオーク',
    description: 'シェリー樽で熟成されたスコットランドを代表するシングルモルト。ドライフルーツのような豊かな甘みと複雑な旨み。',
    versionNo: 1,
  },
  {
    categoryKey: 'アイラ',
    name: 'ラフロイグ 10年',
    description: 'アイラ島を代表するシングルモルト。強烈なスモーキーさとヨード香、海風を感じさせる個性的な味わい。',
    versionNo: 1,
  },
  // アイリッシュウイスキー
  {
    categoryKey: 'アイリッシュウイスキー',
    name: 'ジェムソン スタンダード',
    description: 'アイルランドを代表するブレンデッドウイスキー。トリプルディスティレーションによる滑らかで飲みやすい味わい。',
    versionNo: 1,
  },
  // 赤ワイン
  {
    categoryKey: '赤ワイン',
    name: 'シャトー・マルゴー 2015',
    description: 'ボルドー・メドック格付け第1級。エレガントで複雑な香りと繊細なタンニンを持つフランスを代表する赤ワイン。',
    versionNo: 1,
  },
  {
    categoryKey: '赤ワイン',
    name: 'シャトー・ペトリュス',
    description: 'ボルドー・ポムロールの伝説的ワイン。メルロー主体で造られる濃厚かつ緻密な味わいは世界最高峰のひとつ。',
    versionNo: 1,
  },
  {
    categoryKey: '赤ワイン',
    name: 'ロマネ・コンティ',
    description: 'ブルゴーニュ・ヴォーヌ・ロマネの特級畑。ピノ・ノワール100%で造られる世界最高値・最高評価の赤ワイン。',
    versionNo: 1,
  },
  {
    categoryKey: '赤ワイン',
    name: 'カッシェーロ・デル・ディアブロ カベルネ・ソーヴィニヨン',
    description: 'チリ・コンチャ・イ・トロの代表ワイン。凝縮した果実味とスムーズなタンニンのコスパ抜群な赤ワイン。',
    versionNo: 1,
  },
  {
    categoryKey: '赤ワイン',
    name: 'バローロ リゼルヴァ（ガヤ）',
    description: 'イタリア・ピエモンテ産。「ワインの王」と称されるネッビオーロ100%。力強いタンニンと複雑な香りが特徴。',
    versionNo: 1,
  },
  // 白ワイン
  {
    categoryKey: '白ワイン',
    name: 'ルフレーヴ ピュリニー・モンラッシェ',
    description: 'ブルゴーニュを代表する白ワイン。シャルドネ100%で造られる、ミネラル感と上品な果実味が調和した逸品。',
    versionNo: 1,
  },
  {
    categoryKey: '白ワイン',
    name: 'エゴン・ミュラー シャルツホーフベルガー リースリング',
    description: 'ドイツ・モーゼルの最高峰リースリング。繊細な甘みとシャープな酸が見事に融合した世界最高の白ワインのひとつ。',
    versionNo: 1,
  },
  {
    categoryKey: '白ワイン',
    name: 'クロ・サント・ユーヌ アルザス',
    description: 'フランス・アルザスの辛口白ワイン。複数品種をブレンドした複雑な香りと豊かなミネラル感が特徴。',
    versionNo: 1,
  },
  {
    categoryKey: '白ワイン',
    name: 'グラーヴナー リボッラ・ジャッラ（オレンジワイン）',
    description: 'イタリア・フリウリ産のオレンジワイン。果皮ごと長期浸漬で造られる琥珀色の白ワイン。複雑な風味と独特の渋み。',
    versionNo: 1,
  },
  // ロゼワイン
  {
    categoryKey: 'ロゼワイン',
    name: 'シャトー・ダントルキャストー プロヴァンス・ロゼ',
    description: 'フランス・プロヴァンスの淡いサーモンピンクのロゼ。繊細な果実香とドライな後味が夏に人気。',
    versionNo: 1,
  },
  {
    categoryKey: 'ロゼワイン',
    name: 'バンドール・ロゼ（テンプィエ）',
    description: 'プロヴァンス最高峰のロゼワイン生産地バンドールの一本。ムールヴェードル主体で力強くスパイシー。',
    versionNo: 1,
  },
  // スパークリングワイン
  {
    categoryKey: 'スパークリングワイン',
    name: 'モエ・エ・シャンドン ブリュット アンペリアル',
    description: 'フランスを代表するシャンパーニュハウスの定番シャンパン。フレッシュな果実味と上品な泡立ちが特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'スパークリングワイン',
    name: 'クリュッグ グランド・キュヴェ',
    description: 'シャンパーニュの最高峰のひとつ。複数年のヴァン・ド・レゼルヴをブレンドした複雑で豊かな味わい。',
    versionNo: 1,
  },
  {
    categoryKey: 'スパークリングワイン',
    name: 'サンタ・マルゲリータ プロセッコ',
    description: 'イタリア・ヴェネト産の定番プロセッコ。フレッシュな青りんごと花の香り、軽やかな泡が特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'スパークリングワイン',
    name: 'コドルニウ クラシコ・ブリュット（カバ）',
    description: 'スペイン産スパークリングワイン「カバ」の老舗。シャンパン製法で造られるコスパ優秀な辛口スパークリング。',
    versionNo: 1,
  },
  // デザートワイン
  {
    categoryKey: 'デザートワイン',
    name: 'シャトー・ディケム 2011',
    description: 'フランス・ソーテルヌ格付け最高峰の貴腐ワイン。黄金色に輝く濃密な甘みとフレッシュな酸のバランスが唯一無二。',
    versionNo: 1,
  },
  {
    categoryKey: 'デザートワイン',
    name: 'トロッケンベーレンアウスレーゼ（エゴン・ミュラー）',
    description: 'ドイツ産の最高貴腐ワイン。極限まで凝縮されたリースリングの甘みは蜂蜜のように濃厚で、世界最高値のデザートワイン。',
    versionNo: 1,
  },
  {
    categoryKey: 'デザートワイン',
    name: 'グラハム 20年 トゥニー・ポート',
    description: 'ポルトガル・ドウロ産のポートワイン。20年熟成でナッツや干しぶどうの豊かな香り、まろやかな甘みが特徴。',
    versionNo: 1,
  },
  // フルーツ系
  {
    categoryKey: 'フルーツ系',
    name: 'コアントロー',
    description: 'フランス産のオレンジリキュール。甘くフルーティーな香りで、マルガリータやサイドカーなどカクテルに幅広く使われる。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'グラン・マルニエ コルドン・ルージュ',
    description: 'フランス産のオレンジリキュール。コニャックベースで深みのある甘みと芳醇な香りが特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'ミドリ メロンリキュール',
    description: '日本のサントリーが開発したメロンリキュール。鮮やかな緑色と甘いメロンの香りでカクテルに人気。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'ピーチツリー',
    description: 'オランダ生まれの桃のリキュール。甘く華やかな桃の香りが特徴で、フルーツカクテルに欠かせない定番。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'マリブ ココナッツ',
    description: 'バルバドス産のホワイトラムをベースにしたココナッツリキュール。甘くトロピカルな風味でカクテルに人気。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'クレーム・ド・カシス（ディジョン産）',
    description: 'フランス・ブルゴーニュ地方産の黒スグリのリキュール。キール（白ワイン割り）の材料として世界的に有名。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'フランボワーズ（木苺）リキュール',
    description: '木苺（ラズベリー）を使ったリキュール。鮮やかな赤色と甘酸っぱい香りでデザートカクテルに活躍。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'ルジェ クレーム・ド・ミューレ（ブラックベリー）',
    description: 'フランス産のブラックベリーリキュール。濃厚な果実感と甘みが特徴。カクテルやデザートに使われる。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'ソルバーグ レモンチェッロ',
    description: 'イタリア・アマルフィ海岸産レモンを使ったリキュール。鮮烈なレモンの香りと甘みが特徴で食後酒として人気。',
    versionNo: 1,
  },
  {
    categoryKey: 'フルーツ系',
    name: 'アペロール',
    description: 'イタリア産のオレンジ・ルバーブベースのリキュール。アペロール・スプリッツとして世界的に大人気。',
    versionNo: 1,
  },
  // ハーブ系
  {
    categoryKey: 'ハーブ系',
    name: 'カンパリ',
    description: 'イタリア生まれの苦みが特徴のリキュール。鮮やかな赤色とハーブの香りで、カンパリソーダやネグローニに使われる。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'シャルトリューズ ヴェール（グリーン）',
    description: 'フランス・カルトジオ会修道士が製造するハーブリキュール。130種以上のハーブを使用した複雑で神秘的な味わい。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'ベネディクティン DOM',
    description: 'フランス・ノルマンディー修道院由来の27種のハーブ・スパイスを使ったリキュール。甘くスパイシーな複雑な味。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'イエガーマイスター',
    description: 'ドイツ産の56種のハーブ・根・果物・スパイスを使ったハーブリキュール。独特のビター感と甘みが人気。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'ガリアーノ',
    description: 'イタリア産のバニラとアニス風味のハーブリキュール。ハーヴェイ・ウォールバンガーのカクテルで有名。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'ドランブイ',
    description: 'スコットランド産のスコッチウイスキーにハチミツ・ハーブを加えたリキュール。ラスティ・ネイルに使われる。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'ペルノ アブサン',
    description: 'アニス・フェンネル・グランウォームウッドを主成分とするフランスのリキュール。独特のアニス香が特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'サンブーカ',
    description: 'イタリア産のアニス系リキュール。甘くアニスの香りが強く、コーヒー豆を浮かべて提供する「フライング・エンジェル」で有名。',
    versionNo: 1,
  },
  {
    categoryKey: 'ハーブ系',
    name: 'クレーム・ド・メント',
    description: 'ペパーミントを使ったリキュール。さわやかな清涼感があり、グラスホッパーなどのカクテルに使用される。',
    versionNo: 1,
  },
  // ナッツ系
  {
    categoryKey: 'ナッツ系',
    name: 'アマレット ディサローノ',
    description: 'イタリア産のアーモンド・アプリコット種子ベースのリキュール。甘くナッティな香りで世界中で愛される。',
    versionNo: 1,
  },
  {
    categoryKey: 'ナッツ系',
    name: 'フランジェリコ',
    description: 'イタリア・ピエモンテ産のヘーゼルナッツリキュール。ナッティで甘くバニラの風味も感じる人気リキュール。',
    versionNo: 1,
  },
  {
    categoryKey: 'ナッツ系',
    name: 'アニセット',
    description: 'アニスシードを主体にしたリキュール。フランス・スペインなど地中海沿岸諸国で古くから愛飲されている。',
    versionNo: 1,
  },
  // その他リキュール（コーヒー・カカオ系）
  {
    categoryKey: 'リキュールその他',
    name: 'カルーア コーヒーリキュール',
    description: 'メキシコ産のコーヒーリキュール。甘くリッチなコーヒーの香りでカルーア・ミルクとして世界的に有名。',
    versionNo: 1,
  },
  {
    categoryKey: 'リキュールその他',
    name: 'ティア・マリア',
    description: 'ジャマイカ産のコーヒーリキュール。ブルーマウンテンコーヒーをベースにしたリッチな風味が特徴。',
    versionNo: 1,
  },
  {
    categoryKey: 'リキュールその他',
    name: 'クレーム・ド・カカオ（ダーク）',
    description: 'カカオ豆を使ったリキュール。チョコレートの甘い香りとほろ苦さが特徴で、デザートカクテルに活躍。',
    versionNo: 1,
  },
  {
    categoryKey: 'リキュールその他',
    name: 'モーツァルト ダーク チョコレートリキュール',
    description: 'オーストリア産のダークチョコレートリキュール。上質なカカオを使用した濃厚でリッチな味わい。',
    versionNo: 1,
  },
  // その他リキュール（クリーム系）
  {
    categoryKey: 'リキュールその他',
    name: 'ベイリーズ アイリッシュ クリーム',
    description: 'アイルランド産のクリームリキュール。アイリッシュウイスキーとクリームを合わせた甘くまろやかな味わい。',
    versionNo: 1,
  },
  {
    categoryKey: 'リキュールその他',
    name: 'カルーア ミルク',
    description: 'カルーアとミルクを合わせたカクテルスタイルのクリーム系リキュール。コーヒーとミルクの甘い組み合わせ。',
    versionNo: 1,
  },
  {
    categoryKey: 'リキュールその他',
    name: 'アドヴォカート',
    description: 'オランダ産の卵黄・砂糖・ブランデーを使ったクリーム系リキュール。濃厚でカスタードのような味わい。',
    versionNo: 1,
  },
  // ラム
  {
    categoryKey: 'ラム',
    name: 'バカルディ スペリオール',
    description: 'キューバ発祥のホワイトラム。軽やかでクリーンな味わいでモヒートやダイキリに最適。',
    versionNo: 1,
  },
];

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

    const existingMap = await fetchAllLiquors(client);

    // ── refresh: 既存 Liquor を全削除 ───────────────────────────
    if (options.refresh && existingMap.size > 0) {
      if (options.dryRun) {
        console.log(`  (dry) ${existingMap.size} 件を削除予定`);
      } else {
        console.log(`  🗑 既存 ${existingMap.size} 件を削除中...`);
        for (const id of existingMap.values()) {
          const { errors } = await client.models.Liquor.delete({ id });
          if (errors?.length) {
            console.error(`  ✗ 削除失敗 ${id}:`, errors[0].message);
          }
        }
        existingMap.clear();
      }
    }
    // ─────────────────────────────────────────────────────────────

    for (const item of liquorData) {
      const category = CATEGORIES[item.categoryKey];
      const label = `${item.name} [${item.categoryKey}]`;
      const key = `${item.name}:${category.id}`;

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
