import type { Schema } from '@/amplify/data/resource';
import { client } from '@/lib/amplify-client';

type LiquorUpdateInput = Schema['Liquor']['updateType'];
type LiquorCreateInput = Schema['Liquor']['createType'];
type LiquorHistoryCreateInput = Schema['LiquorHistory']['createType'];
type AuthMode = 'userPool' | 'apiKey' | 'identityPool';

export async function updateLiquor(input: LiquorUpdateInput, authMode?: AuthMode): Promise<void> {
  await client.models.Liquor.update(input, authMode ? { authMode } : undefined);
}

export async function createLiquorHistory(input: LiquorHistoryCreateInput, authMode?: AuthMode): Promise<void> {
  await client.models.LiquorHistory.create(input, authMode ? { authMode } : undefined);
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
