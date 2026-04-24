export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Non renseigne';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatShortDate(value?: string | null) {
  if (!value) {
    return 'Non renseigne';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function humanizeStatus(value?: string | null) {
  if (!value) {
    return 'Inconnu';
  }

  return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function initials(firstName?: string | null, lastName?: string | null) {
  return [firstName, lastName]
    .filter(Boolean)
    .map((item) => item!.trim().charAt(0).toUpperCase())
    .join('')
    .slice(0, 2);
}
