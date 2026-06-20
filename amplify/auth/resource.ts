import { defineAuth, defineFunction } from '@aws-amplify/backend';

export const auth = defineAuth({
  loginWith: {
    email: true,
  },
  groups: ['admin'],
  triggers: {
    defineAuthChallenge: defineFunction({
      name: 'define-auth-challenge',
      entry: '../functions/auth/define-auth-challenge/handler.ts',
    }),
    createAuthChallenge: defineFunction({
      name: 'create-auth-challenge',
      entry: '../functions/auth/create-auth-challenge/handler.ts',
    }),
    verifyAuthChallengeResponse: defineFunction({
      name: 'verify-auth-challenge-response',
      entry: '../functions/auth/verify-auth-challenge-response/handler.ts',
    }),
  },
});
