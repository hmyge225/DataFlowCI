import { useState } from 'react';
import type { FormEvent } from 'react';
import { User, Mail, Lock, Building2 } from 'lucide-react';
import { validateRegister, isValid } from '../utils/validation';
import { useRegister } from '../hooks/useAuth';
import AuthLayout from './AuthLayout';
import AuthInput from './AuthInput';

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    nameCorporate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const register = useRegister();

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

    const fieldErrors = validateRegister(form);
    if (!isValid(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    register.mutate(form);
  }

  return (
    <AuthLayout
      panelSide="left"
      panelTitle="Welcome Back!"
      panelText="Pour rester connecté avec nous, merci de vous connecter avec vos informations personnelles"
      panelButtonText="Se connecter"
      panelButtonTo="/login"
      formTitle="Créer un compte"
    >
      <div className="flex items-center gap-3">
        {['f', 'G+', 'in'].map((label) => (
          <span
            key={label}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-brand/30 text-xs font-semibold text-brand"
          >
            {label}
          </span>
        ))}
      </div>
      <p className="text-xs text-text-muted">or use your email for registration:</p>

      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4">
        <div className="flex gap-3">
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
          placeholder="Password"
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

        <button
          type="submit"
          disabled={register.isPending}
          className="mt-2 rounded-full bg-brand py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {register.isPending ? 'Inscription...' : 'S\'inscrire'}
        </button>

      </form>
    </AuthLayout>
  );
}
