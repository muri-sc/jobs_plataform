const KEY = 'devstart_preferences';

const DEFAULTS = {
  preferred_role: '',
  location: '',
  work_model: '',
};

/** Preferências de busca (localStorage). Não faz parte da sessão JWT. */
export function loadPreferences() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULTS };
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULTS };
  }
}

export function savePreferences(prefs) {
  const next = {
    preferred_role: prefs.preferred_role?.trim() || '',
    location: prefs.location?.trim() || '',
    work_model: prefs.work_model || '',
  };
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
