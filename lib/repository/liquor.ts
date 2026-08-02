import type { Schema } from '@/amplify/data/resource';
import { client } from '@/lib/amplify-client';

type LiquorUpdateInput = Schema['Liquor']['updateType'];
type LiquorCreateInput = Schema['Liquor']['createType'];
type LiquorHistoryCreateInput = Schema['LiquorHistory']['createType'];
type AuthMode = 'userPool' | 'apiKey' | 'identityPool';

export async function updateLiquor(input: LiquorUpdateInput, authMode?: AuthMode): Promise<void> {
  const { errors } = await client.models.Liquor.update(input, authMode ? { authMode } : undefined);
  if (errors?.length) throw new Error(errors[0].message);
}

export async function createLiquorHistory(input: LiquorHistoryCreateInput, authMode?: AuthMode): Promise<void> {
  const { errors } = await client.models.LiquorHistory.create(input, authMode ? { authMode } : undefined);
  if (errors?.length) throw new Error(errors[0].message);
}

/** お酒を新規作成する。作成したお酒の id を返す。 */
export async function createLiquor(
  input: LiquorCreateInput,
): Promise<string | undefined> {
  const { data: newLiquor, errors } = await client.models.Liquor.create(
    input,
    { authMode: 'identityPool' },
  );
  if (errors?.length) throw new Error(errors[0].message);
  return newLiquor?.id;
}
