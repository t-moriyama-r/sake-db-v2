import { defineFunction } from '@aws-amplify/backend';
export const getAffiliateData = defineFunction({ name: 'getAffiliateData', entry: './handler.ts', runtime: 22 });
