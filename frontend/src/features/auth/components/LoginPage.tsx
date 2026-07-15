import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { validateLogin, isValid } from '../utils/validation';
import { useLogin } from '../hooks/useAuth';
import { useAuth } from '../context/AuthContext';
import AuthLayout from './AuthLayout';
import AuthInput from './AuthInput';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const login = useLogin();

  const navigate = useNavigate();
  const { user } = useAuth();

  // Ne navigue qu'une fois le contexte `user` réellement mis à jour,
  // pour que ProtectedRoute voie le bon utilisateur dès le premier rendu.
  useEffect(() => {
    if (user) {
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard', { replace: true });
    }
  }, [user, navigate]);

  function clearError(field: string) {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});

    const fieldErrors = validateLogin({ email, password });
    if (!isValid(fieldErrors)) {
      setErrors(fieldErrors);
      return;
    }

    login.mutate({ email, password });
  }

  return (
    <AuthLayout
      panelSide="right"
      panelTitle="Hello, Friend!"
      panelText="Entrez vos informations personnelles et commencez votre aventure avec nous"
      panelButtonText="S'inscrire"
      panelButtonTo="/register"
      formTitle="Connexion"
    >
      <form onSubmit={handleSubmit} className="flex w-full max-w-xs flex-col gap-4">
        <AuthInput
          icon={Mail}
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          error={errors.email}
        />
        <AuthInput
          icon={Lock}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError('password');
          }}
          error={errors.password}
        />

        <button
          type="submit"
          className="mt-2 rounded-full bg-brand py-2.5 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          Se connecter
        </button>

      </form>
    </AuthLayout>
  );
}
