import 'reflect-metadata';

import { HealthController } from '@application/controllers/health/HealthController.js';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter.js';

export const handler = lambdaHttpAdapter(HealthController);

