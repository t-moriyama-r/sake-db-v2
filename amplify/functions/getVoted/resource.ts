import { defineFunction } from '@aws-amplify/backend';
export const getVoted = defineFunction({ name: 'getVoted', entry: './handler.ts', runtime: 22 });
