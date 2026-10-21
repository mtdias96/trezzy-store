import 'reflect-metadata';

import { HealthController } from '@application/controllers/health/HealthController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter(HealthController);

