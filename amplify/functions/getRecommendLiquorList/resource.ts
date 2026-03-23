import { defineFunction } from '@aws-amplify/backend';
export const getRecommendLiquorList = defineFunction({ name: 'getRecommendLiquorList', entry: './handler.ts' });
