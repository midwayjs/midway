import { VerificationCodeOptions } from '../interface';

export const verificationCode: VerificationCodeOptions = {
  image: {
    size: 4,
    noise: 1,
    width: 120,
    height: 40,
    type: 'mixed',
  },
  expirationTime: 3600,
  idPrefix: 'midway:vc',
};
