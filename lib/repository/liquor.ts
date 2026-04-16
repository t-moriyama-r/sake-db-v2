import { client } from '@/lib/amplify-client';
import type { Schema } from '@/amplify/data/resource';

type LiquorUpdateInput = Schema['Liquor']['updateType'];
type LiquorCreateInput = Schema['Liquor']['createType'];
type LiquorHistoryCreateInput = Schema['LiquorHistory']['createType'];

export async function updateLiquor(input: LiquorUpdateInput): Promise<void> {
  await client.models.Liquor.update(input);
}

export async function createLiquorHistory(input: LiquorHistoryCreateInput): Promise<void> {
  await client.models.LiquorHistory.create(input);
}

/** お酒を新規作成する。作成したお酒の id を返す。 */
export async function createLiquor(
  input: LiquorCreateInput,
): Promise<string | undefined> {
  const { data: newLiquor } = await client.models.Liquor.create(
    input,
    { authMode: 'identityPool' },
  );
  return newLiquor?.id;
}
