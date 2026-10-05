import { z } from 'zod';

export const CreateUserInputSchema = {
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    age: z.number().int().min(0).max(150).optional(),
  }),
};

export const QueryUserInputSchema = {
  query: z.object({
    keyword: z.string().optional(),
  }),
};

export const UserOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  age: z.number().optional(),
});
