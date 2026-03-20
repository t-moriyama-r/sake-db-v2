import { defineFunction } from '@aws-amplify/backend';
export const randomRecommendList = defineFunction({ entry: './handler.ts' });
