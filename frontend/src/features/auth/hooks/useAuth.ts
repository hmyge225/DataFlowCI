import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  loginRequest,
  registerRequest,
  createUserRequest,
  meRequest,
} from '../services/auth.service';
import { useAuth } from '../context/AuthContext';
import type { LoginInput, RegisterInput, CreateUserInput } from '../schemas';

// Ne navigue pas ici : on se contente de mettre à jour le contexte.
// La navigation (voir LoginPage) est déclenchée par un useEffect qui observe
// `user`, afin d'être sûr que ProtectedRoute lit bien le nouvel utilisateur
// avant de monter la route protégée (évite le "flash" nécessitant un refresh).
export function useLogin() {
  const { setUser } = useAuth();

  return useMutation({
    mutationFn: (input: LoginInput) => loginRequest(input),
    onSuccess: async () => {
      const me = await meRequest();
      setUser(me);
      toast.success('Connexion réussie.');
    },
    onError: () => toast.error('Identifiants invalides.'),
  });
}

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: RegisterInput) => registerRequest(input),
    onSuccess: () => {
      toast.success('Inscription réussie. Vous pouvez vous connecter.');
      navigate('/login');
    },
    onError: () => toast.error("Une erreur est survenue. L'email est peut-être déjà utilisé."),
  });
}

// Réservé aux admins : crée un utilisateur (USER ou ADMIN) sans changer la session courante.
export function useCreateUser() {
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUserRequest(input),
    onSuccess: () => toast.success('Utilisateur créé avec succès.'),
    onError: () => toast.error("Échec de la création. L'email est peut-être déjà utilisé."),
  });
}
