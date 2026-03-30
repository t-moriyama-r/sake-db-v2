import { a } from '@aws-amplify/backend';
import { checkAdmin } from '../../functions/checkAdmin/resource';

/** admin グループ関連のクエリ */
export const adminSchema = {
  /** admin グループに所属しているか判定 */
  checkAdmin: a
    .query()
    .returns(a.boolean().required())
    .authorization((allow) => [allow.authenticated()])
    .handler(a.handler.function(checkAdmin)),
};
