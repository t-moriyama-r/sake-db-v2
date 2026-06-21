import type { Schema } from '@/amplify/data/resource';
import { client } from '@/lib/amplify-client';

type LiquorUpdateInput = Schema['Liquor']['updateType'];
type LiquorCreateInput = Schema['Liquor']['createType'];
type LiquorHistoryCreateInput = Schema['LiquorHistory']['createType'];
type AuthMode = 'userPool' | 'apiKey' | 'identityPool';

export type LiquorHistoryRecord = Schema['LiquorHistory']['type'];

export async function updateLiquor(input: LiquorUpdateInput, authMode?: AuthMode): Promise<void> {
  await client.models.Liquor.update(input, authMode ? { authMode } : undefined);
}

export async function createLiquorHistory(input: LiquorHistoryCreateInput, authMode?: AuthMode): Promise<void> {
  await client.models.LiquorHistory.create(input, authMode ? { authMode } : undefined);
}

export async function fetchLiquorHistories(liquorId: string, authMode?: AuthMode): Promise<LiquorHistoryRecord[]> {
  const { data } = await client.models.LiquorHistory.list({
    filter: { liquorId: { eq: liquorId } },
    ...(authMode ? { authMode } : {}),
  });
  return (data ?? [])
    .filter((h): h is NonNullable<typeof h> => h !== null)
    .sort((a, b) => (b.versionNo ?? 0) - (a.versionNo ?? 0));
}

/** お酒を新規作成する。作成したお酒の id を返す。 */
export async function createLiquor(
  input: LiquorCreateInput,
  authMode?: AuthMode,
): Promise<string | undefined> {
  const { data: newLiquor } = await client.models.Liquor.create(
    input,
    authMode ? { authMode } : undefined,
  );
  return newLiquor?.id;
}
