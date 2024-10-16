import { NextApiRequest, NextApiResponse } from 'next';
import * as yup from 'yup';

type ValidationSchema = yup.ObjectSchema<any>;

export const validationMiddleware = (schema: ValidationSchema) => {
  return (handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) => {
    return async (req: NextApiRequest, res: NextApiResponse) => {
      try {
        await schema.validate(req.body);
        return handler(req, res);
      } catch (error: unknown) {
        if (error instanceof yup.ValidationError) {
          const errors = error.inner.reduce((acc: Record<string, string>, curr: yup.ValidationError) => {
            if (curr.path) {
              acc[curr.path] = curr.message;
            }
            return acc;
          }, {});
          res.status(400).json({ errors });
        } else {
          res.status(500).json({ error: 'バリデーションエラーが発生しました' });
        }
      }
    };
  };
};