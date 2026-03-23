import { defineFunction } from '@aws-amplify/backend';
export const listFromCategory = defineFunction({ name: 'listFromCategory', entry: './handler.ts' });
