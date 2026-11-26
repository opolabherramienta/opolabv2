// Turns an error from Supabase (or the network) into a sentence the user can
// read. The raw text is in English and names tables and columns, so it never
// reaches the screen: callers log it and show this instead.

const FALLBACK = "Inténtalo de nuevo en un momento.";

const KNOWN: Array<[RegExp, string | ((match: RegExpMatchArray) => string)]> = [
  [/invalid login credentials/i, "El correo o la contraseña no son correctos."],
  [/email not confirmed/i, "Confirma tu correo antes de entrar: te enviamos un enlace al registrarte."],
  [/already registered|already been registered/i, "Ya hay una cuenta con ese correo."],
  [
    /password should be at least (\d+)/i,
    (match) => `La contraseña debe tener al menos ${match[1]} caracteres.`,
  ],
  [/different from the old password|same password/i, "La contraseña nueva debe ser distinta de la anterior."],
  [/weak password|password is too weak|pwned/i, "Esa contraseña es demasiado fácil de adivinar. Prueba con otra."],
  [/invalid email|unable to validate email|email address .* is invalid/i, "Ese correo no parece válido."],
  [/rate limit|too many requests|only request this after/i, "Demasiados intentos seguidos. Espera unos minutos y vuelve a probar."],
  [/failed to fetch|fetch failed|networkerror|network request failed|load failed/i, "No hay conexión. Comprueba tu red y vuelve a probar."],
  [/jwt|not authenticated|auth session missing|session.*(expired|not found)|refresh token/i, "Tu sesión ha caducado. Vuelve a entrar."],
  [/row-level security|permission denied|not authorized/i, "No tienes permiso para hacer esto."],
  [/duplicate key|already exists/i, "Eso ya estaba guardado."],
  [/timeout|timed out/i, "El servidor ha tardado demasiado. Vuelve a probar."],
];

const OUTPUTS = new Set<string>([FALLBACK]);

for (const [, text] of KNOWN) {
  if (typeof text === "string") OUTPUTS.add(text);
}

function rawMessage(error: unknown) {
  if (typeof error === "string") return error;

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;

    return typeof message === "string" ? message : "";
  }

  return "";
}

/** A full sentence in Spanish, ending in a period. Safe to call twice. */
export function friendlyError(error: unknown): string {
  const raw = rawMessage(error);

  // Already one of ours (an error rethrown with a friendly message).
  if (OUTPUTS.has(raw) || /^La contraseña debe tener al menos \d+ caracteres\.$/.test(raw)) {
    return raw;
  }

  for (const [pattern, text] of KNOWN) {
    const match = raw.match(pattern);

    if (match) return typeof text === "string" ? text : text(match);
  }

  return FALLBACK;
}
