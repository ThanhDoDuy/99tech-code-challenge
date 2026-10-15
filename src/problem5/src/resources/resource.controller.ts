import type { Request, Response } from 'express';
import { notFound } from '../errors';
import { resourceRepository } from './resource.repository';
import type {
  CreateResourceInput,
  ListQuery,
  UpdateResourceInput,
} from './resource.schema';

export const resourceController = {
  // POST /resources
  create(req: Request, res: Response) {
    const input = req.body as CreateResourceInput;
    const resource = resourceRepository.create(input);
    res.status(201).json(resource);
  },

  // GET /resources
  list(req: Request, res: Response) {
    const query = req.query as unknown as ListQuery;
    const { items, total } = resourceRepository.list(query);
    res.json({
      data: items,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  },

  // GET /resources/:id
  getById(req: Request, res: Response) {
    const resource = resourceRepository.findById(req.params.id);
    if (!resource) throw notFound();
    res.json(resource);
  },

  // PUT /resources/:id
  update(req: Request, res: Response) {
    const input = req.body as UpdateResourceInput;
    const resource = resourceRepository.update(req.params.id, input);
    if (!resource) throw notFound();
    res.json(resource);
  },

  // DELETE /resources/:id
  remove(req: Request, res: Response) {
    const deleted = resourceRepository.remove(req.params.id);
    if (!deleted) throw notFound();
    res.status(204).send();
  },
};
