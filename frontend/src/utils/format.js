const WORK_MODEL_LABELS = {
  remote: 'Remoto',
  hybrid: 'Híbrido',
  onsite: 'Presencial',
};

const STATUS_LABELS = {
  open: 'Aberta',
  closed: 'Fechada',
  submitted: 'Enviada',
  reviewing: 'Em análise',
  approved: 'Aprovada',
  rejected: 'Recusada',
};

export function workModelLabel(value) {
  return WORK_MODEL_LABELS[value] || value || '—';
}

export function statusLabel(value) {
  return STATUS_LABELS[value] || value || '—';
}

export function formatSalary(min, max) {
  const toBRL = (n) =>
    Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (min == null && max == null) return 'A combinar';
  if (min != null && max != null) return `${toBRL(min)} – ${toBRL(max)}`;
  if (min != null) return `A partir de ${toBRL(min)}`;
  return `Até ${toBRL(max)}`;
}

export function formatDateTime(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
