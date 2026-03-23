import { defineFunction } from '@aws-amplify/backend';
export const getFlavorMap = defineFunction({ name: 'getFlavorMap', entry: './handler.ts' });
