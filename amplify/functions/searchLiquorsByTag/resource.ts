import { defineFunction } from '@aws-amplify/backend';
export const searchLiquorsByTag = defineFunction({ name: 'searchLiquorsByTag', entry: './handler.ts' });
