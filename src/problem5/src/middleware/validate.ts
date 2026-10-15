import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

/**
 * Validate (and coerce) a part of the request against a Zod schema.
 * On success the parsed value replaces the original on the request.
 */
export const validate =
  (schema: ZodSchema, source: Source = 'body'): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(result.error);
    }
    // Replace with the parsed (defaulted / coerced) data.
    req[source] = result.data as never;
    next();
  };
