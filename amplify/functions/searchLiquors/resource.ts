import { defineFunction } from '@aws-amplify/backend';
export const searchLiquors = defineFunction({ entry: './handler.ts' });
