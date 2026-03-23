import { defineFunction } from '@aws-amplify/backend';
export const searchLiquors = defineFunction({ name: 'searchLiquors', entry: './handler.ts' });
