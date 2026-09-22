import { z } from "zod";

// validateBody
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(422).json({ errors: z.treeifyError(result.error).properties });
      return;
    }

    req.body = result.data;
    next();
  };
}
