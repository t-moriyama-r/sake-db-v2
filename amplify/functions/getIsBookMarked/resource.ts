import { defineFunction } from '@aws-amplify/backend';
export const getIsBookMarked = defineFunction({ name: 'getIsBookMarked', entry: './handler.ts', runtime: 22 });
