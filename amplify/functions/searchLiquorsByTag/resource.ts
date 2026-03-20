import { defineFunction } from '@aws-amplify/backend';
export const searchLiquorsByTag = defineFunction({ entry: './handler.ts' });
