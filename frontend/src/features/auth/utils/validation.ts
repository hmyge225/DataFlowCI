// Validations manuelles pour les formulaires d'authentification (connexion / inscription).
// Chaque fonction retourne un objet d'erreurs { champ: message }. Objet vide = pas d'erreur.

export type ValidationErrors = Record<string, string>;

interface LoginData {
  email?: string;
  password?: string;
}

interface RegisterData {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  nameCorporate?: string;
}

const REQUIRED_MSG = 'Ce champ est requis';
const EMAIL_MSG = "L'adresse email n'est pas valide";
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MSG = `Le mot de passe doit contenir au moins ${PASSWORD_MIN_LENGTH} caractères`;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

// --- CONNEXION ---
export function validateLogin(data: LoginData): ValidationErrors {
  const e: ValidationErrors = {};

  if (!data.email?.trim()) e.email = 'Connexion - Email : ' + REQUIRED_MSG;
  else if (!isValidEmail(data.email)) e.email = 'Connexion - Email : ' + EMAIL_MSG;

  if (!data.password) e.password = 'Connexion - Mot de passe : ' + REQUIRED_MSG;

  return e;
}

// --- INSCRIPTION ---
export function validateRegister(data: RegisterData): ValidationErrors {
  const e: ValidationErrors = {};

  if (!data.firstName?.trim()) e.firstName = 'Prénom : ' + REQUIRED_MSG;
  if (!data.lastName?.trim()) e.lastName = 'Nom : ' + REQUIRED_MSG;

  if (!data.email?.trim()) e.email = 'Email : ' + REQUIRED_MSG;
  else if (!isValidEmail(data.email)) e.email = 'Email : ' + EMAIL_MSG;

  if (!data.password) e.password = 'Mot de passe : ' + REQUIRED_MSG;
  else if (data.password.length < PASSWORD_MIN_LENGTH) {
    e.password = 'Mot de passe : ' + PASSWORD_MSG;
  }

  if (!data.nameCorporate?.trim()) e.nameCorporate = 'Entreprise : ' + REQUIRED_MSG;

  return e;
}

// Petit utilitaire pour savoir si un objet d'erreurs est vide (formulaire valide).
export function isValid(errors: ValidationErrors): boolean {
  return Object.keys(errors).length === 0;
}
