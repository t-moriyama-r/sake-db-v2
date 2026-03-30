import { defineFunction } from '@aws-amplify/backend';
export const checkAdmin = defineFunction({ name: 'checkAdmin', entry: './handler.ts', runtime: 22 });
