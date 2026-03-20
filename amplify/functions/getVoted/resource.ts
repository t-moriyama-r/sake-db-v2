import { defineFunction } from '@aws-amplify/backend';
export const getVoted = defineFunction({ entry: './handler.ts' });
