import * as Joi from 'joi';
import emailConfig from './email.config';

export const validationSchema = Joi.object({
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().required(),
  DATABASE_USERNAME: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_ACCESS_SECRETKEY: Joi.string().required(),
  JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
  JWT_REFRESH_SECRETKEY: Joi.string().required(),
  JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
  KAKAO_REST_API_KEY: Joi.string().required(),
  KAKAO_CLIENT_SECRET: Joi.string().required(),
  KAKAO_REDIRECT_URL: Joi.string().required(),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URL: Joi.string().required(),
  load: [emailConfig],
});