import { Amplify } from 'aws-amplify';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '../../data/resource';

let clientInstance: ReturnType<typeof generateClient<Schema>> | undefined;

export function getDataClient(): ReturnType<typeof generateClient<Schema>> {
  if (clientInstance) return clientInstance;

  const endpoint = process.env.AMPLIFY_DATA_GRAPHQL_ENDPOINT;
  const region = process.env.AWS_REGION;

  if (!endpoint) throw new Error('AMPLIFY_DATA_GRAPHQL_ENDPOINT が設定されていません');
  if (!region) throw new Error('AWS_REGION が設定されていません');

  Amplify.configure({
    API: {
      GraphQL: {
        endpoint,
        region,
        defaultAuthMode: 'iam',
      },
    },
  });

  clientInstance = generateClient<Schema>({ authMode: 'iam' });
  return clientInstance;
}
