import { defineFunction } from '@aws-amplify/backend';
export const randomRecommendList = defineFunction({ name: 'randomRecommendList', entry: './handler.ts', runtime: 22 });
