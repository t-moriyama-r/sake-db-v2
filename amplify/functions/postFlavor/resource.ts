import { defineFunction } from '@aws-amplify/backend';
export const postFlavor = defineFunction({ name: 'postFlavor', entry: './handler.ts', runtime: 22 });
