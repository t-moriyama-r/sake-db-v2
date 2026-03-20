import { defineFunction } from '@aws-amplify/backend';
export const liquorHistories = defineFunction({ entry: './handler.ts' });
