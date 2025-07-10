export function saveUserRoleFromToken(token : string): void {
  if (!token) return;

  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return;

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padLength = (4 - (base64.length % 4)) % 4;
    const padded = base64 + '='.repeat(padLength);

    const payloadJson = atob(padded);
    const payload = JSON.parse(payloadJson);

    const role = payload.role || null;
    if (role) {
      localStorage.setItem('userRole', role);
    }
  } catch (e) {
    console.error('Erro ao decodificar token:', e);
  }
}
