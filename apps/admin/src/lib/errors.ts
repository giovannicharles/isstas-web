import { ApiError } from './api';

export type ErrorKind = 'validation' | 'auth' | 'forbidden' | 'notfound' | 'conflict' | 'throttle' | 'network' | 'server' | 'unknown';

export type Described = {
  kind: ErrorKind;
  /** Titre court, adapte au type d'erreur. */
  title: string;
  /** Phrase en francais, comprehensible par un non-technicien. */
  message: string;
  /** Erreurs par champ (422), cles API telles que renvoyees ("name.fr", "email"...). */
  fields: Record<string, string[]>;
  retryAfter?: number;
};

const SERVER_HINT = 'Réessayez dans un instant. Si le problème persiste, contactez le support technique.';

/**
 * Transforme n'importe quelle erreur (ApiError, erreur reseau, SyntaxError, inconnue) en message clair.
 * Les messages de l'API sont conserves quand ils sont deja lisibles (validation, identifiants).
 */
export function describeError(error: unknown): Described {
  if (error instanceof ApiError) {
    const fields = error.details ?? {};
    switch (error.status) {
      case 0:
        return { kind: 'network', title: 'Connexion impossible', message: error.message, fields };
      case 401:
        return { kind: 'auth', title: 'Session expirée', message: 'Votre session a expiré. Reconnectez-vous pour continuer.', fields };
      case 403:
        return { kind: 'forbidden', title: 'Accès refusé', message: "Votre rôle ne vous permet pas d'effectuer cette action.", fields };
      case 404:
        return { kind: 'notfound', title: 'Introuvable', message: "Cet élément n'existe plus ou a été supprimé.", fields };
      case 409:
        return { kind: 'conflict', title: 'Conflit', message: error.message || "Cet élément a été modifié par quelqu'un d'autre. Rechargez la page.", fields };
      case 419:
        return { kind: 'auth', title: 'Session expirée', message: 'Votre session a expiré. Rechargez la page puis reconnectez-vous.', fields };
      case 422: {
        const count = Object.keys(fields).length;
        return {
          kind: 'validation',
          title: count > 1 ? 'Plusieurs champs à corriger' : 'Vérifiez les informations saisies',
          message: count === 1 ? Object.values(fields)[0]![0]! : error.message || 'Certains champs sont invalides.',
          fields,
        };
      }
      case 429:
        return {
          kind: 'throttle',
          title: 'Trop de tentatives',
          message: error.retryAfter ? `Patientez ${formatWait(error.retryAfter)} avant de réessayer.` : 'Patientez quelques instants avant de réessayer.',
          fields,
          retryAfter: error.retryAfter,
        };
      default:
        if (error.status >= 500) return { kind: 'server', title: 'Erreur du serveur', message: SERVER_HINT, fields };
        return { kind: 'unknown', title: 'Action impossible', message: error.message || SERVER_HINT, fields };
    }
  }
  if (error instanceof SyntaxError) {
    return { kind: 'validation', title: 'Format invalide', message: 'Le contenu saisi n\'est pas un JSON valide. Vérifiez les accolades et les virgules.', fields: {} };
  }
  return { kind: 'unknown', title: 'Erreur inattendue', message: error instanceof Error && error.message ? error.message : SERVER_HINT, fields: {} };
}

export function formatWait(seconds: number): string {
  if (seconds < 60) return `${seconds} s`;
  const m = Math.ceil(seconds / 60);
  return `${m} min`;
}

/** Premier message d'un champ, en acceptant les cles imbriquees ("name.fr" retombe sur "name"). */
export function fieldError(fields: Record<string, string[]>, name: string, lang?: string): string | undefined {
  return fields[lang ? `${name}.${lang}` : name]?.[0] ?? fields[name]?.[0];
}
