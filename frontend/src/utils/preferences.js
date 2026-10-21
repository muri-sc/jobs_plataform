const DEFAULTS = {
  preferred_role: '',
  location: '',
  work_model: '',
};

/** Filtros da sessão atual. Cargo de interesse persistido fica em users.preferred_role. */
let current = { ...DEFAULTS };

export function loadPreferences() {
  return { ...current };
}

export function savePreferences(prefs) {
  current = {
    preferred_role: prefs.preferred_role?.trim() || '',
    location: prefs.location?.trim() || '',
    work_model: prefs.work_model || '',
  };
  return { ...current };
}
