import { defineFunction } from '@aws-amplify/backend';
export const getIsBookMarked = defineFunction({ entry: './handler.ts' });
