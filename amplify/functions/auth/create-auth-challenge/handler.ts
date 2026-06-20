import type { CreateAuthChallengeTriggerHandler } from 'aws-lambda';

export const handler: CreateAuthChallengeTriggerHandler = async (event) => {
  const xUserId = event.request.clientMetadata?.xUserId ?? '';
  event.response.publicChallengeParameters = { type: 'X_AUTH' };
  event.response.privateChallengeParameters = { xUserId };
  event.response.challengeMetadata = 'X_AUTH';
  return event;
};
