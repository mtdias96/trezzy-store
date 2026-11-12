import { Injectable } from '@kernel/decorators/Injectable';
import { Controller } from '@application/contracts/Controller';
import { ConfirmMediaUploadUseCase } from '@application/useCases/media/ConfirmMediaUploadUseCase';

import { mediaParamsSchema } from './schemas/mediaParamsSchema';

@Injectable()
export class ConfirmMediaUploadController extends Controller<'private'> {
  protected override readonly routeType = 'private';

  constructor(private readonly confirmMediaUploadUseCase: ConfirmMediaUploadUseCase) {
    super();
  }

  protected override async handle({ params }: Controller.Request<'private'>): Promise<Controller.Response> {
    const { id } = this.validate(mediaParamsSchema, params);

    await this.confirmMediaUploadUseCase.execute({ mediaId: id });

    return { statusCode: 204 };
  }
}
