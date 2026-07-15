import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, Mail, Lock, Building2 } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useCreateUser } from '../../features/auth/hooks/useAuth';
import { createUserSchema } from '../../features/auth/schemas';
import AuthInput from '../../features/auth/components/AuthInput';

const INITIAL_FORM = {
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  nameCorporate: '',
  role: 'USER' as 'USER' | 'ADMIN',
};

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createUser = useCreateUser();

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const result = createUserSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    createUser.mutate(result.data, {
      onSuccess: () => setForm(INITIAL_FORM),
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">
          Tableau de bord Administrateur
        </h1>
        <p className="text-sm text-text-muted">
          Connecté en tant que {user?.email} ({user?.role})
        </p>
      </div>

      <div className="rounded-2xl bg-white p-8 shadow-sm">
        <h2 className="mb-1 text-lg font-semibold text-brand">
          Créer un utilisateur
        </h2>
        <p className="mb-6 text-sm text-text-muted">
          En tant qu'administrateur, vous pouvez créer un compte avec le rôle
          USER ou ADMIN.
        </p>

        <form onSubmit={handleSubmit} className="grid max-w-2xl gap-4">
          <div className="flex gap-4">
            <AuthInput
              icon={User}
              type="text"
              placeholder="Prénom"
              value={form.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              error={errors.firstName}
            />
            <AuthInput
              icon={User}
              type="text"
              placeholder="Nom"
              value={form.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              error={errors.lastName}
            />
          </div>

          <AuthInput
            icon={Mail}
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={errors.email}
          />

          <AuthInput
            icon={Lock}
            type="password"
            placeholder="Mot de passe (min. 8 caractères)"
            value={form.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
          />

          <AuthInput
            icon={Building2}
            type="text"
            placeholder="Entreprise"
            value={form.nameCorporate}
            onChange={(e) => handleChange('nameCorporate', e.target.value)}
            error={errors.nameCorporate}
          />

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
              Rôle
            </label>
            <select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full rounded-lg bg-surface px-4 py-3 text-sm text-text-primary focus:outline-none"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={createUser.isPending}
            className="mt-2 w-fit rounded-full bg-brand px-8 py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {createUser.isPending ? 'Création...' : "Créer l'utilisateur"}
          </button>

        </form>
      </div>
    </div>
  );
}
