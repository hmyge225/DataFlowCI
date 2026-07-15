import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nameCorporate: z.string().min(1),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3),
});
export type LoginInput = z.infer<typeof loginSchema>;

// Réservé aux admins : permet de choisir le rôle du nouvel utilisateur (USER ou ADMIN).
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  nameCorporate: z.string().min(1),
  role: z.enum(['USER', 'ADMIN']),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

export const meSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  role: z.enum(['USER', 'ADMIN']),
});
export type Me = z.infer<typeof meSchema>;
