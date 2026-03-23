import { defineFunction } from '@aws-amplify/backend';
export const liquorHistories = defineFunction({ name: 'liquorHistories', entry: './handler.ts' });
