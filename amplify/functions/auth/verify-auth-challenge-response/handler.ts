import type { VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda';

export const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const expectedXUserId = event.request.privateChallengeParameters.xUserId;
  event.response.answerCorrect = event.request.challengeAnswer === expectedXUserId;
  return event;
};
