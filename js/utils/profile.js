export function getPreferredName(profile) {
  const firstName = String(profile?.firstName || '').trim().split(/\s+/)[0];
  if (firstName) return firstName;
  const displayName = String(profile?.displayName || '').trim().split(/\s+/)[0];
  if (displayName) return displayName;
  return String(profile?.email || '').trim() || 'Estudiante';
}

