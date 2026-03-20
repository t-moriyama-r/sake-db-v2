import { defineFunction } from '@aws-amplify/backend';
export const checkAdmin = defineFunction({ entry: './handler.ts' });
