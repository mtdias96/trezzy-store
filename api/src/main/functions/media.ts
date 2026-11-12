import 'reflect-metadata';

import { ConfirmMediaUploadController } from '@application/controllers/media/ConfirmMediaUploadController';
import { CreateMediaUploadController } from '@application/controllers/media/CreateMediaUploadController';
import { lambdaHttpAdapter } from '@main/adapters/lambdaHttpAdapter';

export const handler = lambdaHttpAdapter([
  { method: 'POST', path: '/admin/media', handler: CreateMediaUploadController, permission: 'media:write' },
  {
    method: 'POST',
    path: '/admin/media/{id}/confirm',
    handler: ConfirmMediaUploadController,
    permission: 'media:write',
  },
]);
