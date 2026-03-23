import { defineFunction } from '@aws-amplify/backend';
export const getUserByIdDetail = defineFunction({ name: 'getUserByIdDetail', entry: './handler.ts' });
