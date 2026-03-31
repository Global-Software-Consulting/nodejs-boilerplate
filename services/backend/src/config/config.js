const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const Joi = require('joi');

const envPath = path.join(__dirname, '../../.env');
const envExamplePath = path.join(__dirname, '../../.env.example');

dotenv.config({ path: envPath });

const parseKeys = (content) =>
  content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => line.split('=')[0].trim())
    .sort();

if (!fs.existsSync(envPath)) throw new Error('.env file is missing. Copy .env.example to .env and fill in the values.');

const envKeys = parseKeys(fs.readFileSync(envPath, 'utf8'));
const exampleKeys = fs.existsSync(envExamplePath) ? parseKeys(fs.readFileSync(envExamplePath, 'utf8')) : null;

if (exampleKeys) {
  const missingInEnv = exampleKeys.filter((key) => !envKeys.includes(key));
  const missingInExample = envKeys.filter((key) => !exampleKeys.includes(key));

  if (missingInEnv.length) throw new Error(`.env is missing keys defined in .env.example: ${missingInEnv.join(', ')}`);

  if (missingInExample.length)
    throw new Error(`.env.example is missing keys defined in .env: ${missingInExample.join(', ')}`);
}

const envVarsSchema = Joi.object()
  .keys({
    // App
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),

    // JWT
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    JWT_ACCESS_EXPIRATION_MINUTES: Joi.number().default(30).description('minutes after which access tokens expire'),
    JWT_REFRESH_EXPIRATION_DAYS: Joi.number().default(30).description('days after which refresh tokens expire'),
    JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which reset password token expires'),
    JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
      .default(10)
      .description('minutes after which verify email token expires'),

    // SMTP
    SMTP_HOST: Joi.string().allow('').default('').description('SMTP server host'),
    SMTP_PORT: Joi.number().description('SMTP server port'),
    SMTP_USERNAME: Joi.string().allow('').default('').description('SMTP server username'),
    SMTP_PASSWORD: Joi.string().allow('').default('').description('SMTP server password'),
    EMAIL_FROM: Joi.string().allow('').default('').description('sender address for outgoing emails'),

    // Sentry
    SENTRY_DSN: Joi.string().uri().allow('').default('').description('Sentry DSN for error tracking'),

    // Stripe (optional)
    STRIPE_SECRET_KEY: Joi.string().allow('').default('').description('Stripe secret key'),
    STRIPE_WEBHOOK_SECRET: Joi.string().allow('').default('').description('Stripe webhook signing secret'),

    // Workflow Engines (optional)
    INNGEST_EVENT_KEY: Joi.string().allow('').default('').description('Inngest event key'),
    INNGEST_SIGNING_KEY: Joi.string().allow('').default('').description('Inngest signing key'),
    TEMPORAL_ADDRESS: Joi.string().allow('').default('').description('Temporal server address'),
    RESTATE_INGRESS_URL: Joi.string().allow('').default('').description('Restate ingress URL'),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) throw new Error(`Config validation error: ${error.message}`);

module.exports = {
  env: envVars,
};
