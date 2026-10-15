import { Router } from 'express';
import { validate } from '../middleware/validate';
import { resourceController } from './resource.controller';
import {
  createResourceSchema,
  idParamSchema,
  listQuerySchema,
  updateResourceSchema,
} from './resource.schema';

export const resourceRouter = Router();

resourceRouter.post(
  '/',
  validate(createResourceSchema, 'body'),
  resourceController.create,
);

resourceRouter.get(
  '/',
  validate(listQuerySchema, 'query'),
  resourceController.list,
);

resourceRouter.get(
  '/:id',
  validate(idParamSchema, 'params'),
  resourceController.getById,
);

resourceRouter.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateResourceSchema, 'body'),
  resourceController.update,
);

resourceRouter.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  resourceController.remove,
);
