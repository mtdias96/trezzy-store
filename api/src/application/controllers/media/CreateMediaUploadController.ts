import { Injectable } from '@kernel/decorators/Injectable';
import { Schema } from '@kernel/decorators/Schema';
import { Controller } from '@application/contracts/Controller';
import { CreateMediaUploadUseCase } from '@application/useCases/media/CreateMediaUploadUseCase';

import { type CreateMediaUploadBody, createMediaUploadSchema } from './schemas/createMediaUploadSchema';

@Injectable()
@Schema(createMediaUploadSchema)
export class CreateMediaUploadController extends Controller<'private', CreateMediaUploadController.Response> {
  protected override readonly routeType = 'private';

  constructor(private readonly createMediaUploadUseCase: CreateMediaUploadUseCase) {
    super();
  }

  protected override async handle({
    body,
  }: Controller.Request<'private', CreateMediaUploadBody>): Promise<Controller.Response<CreateMediaUploadController.Response>> {
    const { contentType, sizeBytes } = body;

    const { id, uploadUrl } = await this.createMediaUploadUseCase.execute({ contentType, sizeBytes });

    return { statusCode: 201, body: { media: { id, uploadUrl } } };
  }
}

export namespace CreateMediaUploadController {
  export type Response = {
    media: {
      id: string;
      uploadUrl: string;
    };
  };
}
