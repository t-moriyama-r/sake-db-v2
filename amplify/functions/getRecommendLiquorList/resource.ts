import { defineFunction } from '@aws-amplify/backend';
export const getRecommendLiquorList = defineFunction({ entry: './handler.ts' });
