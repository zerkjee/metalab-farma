export const ADMIN_AUTH_KEY = 'metalab_admin_mock_auth';

export function setMockAdminSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(ADMIN_AUTH_KEY, 'true');
  }
}

export function clearMockAdminSession() {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(ADMIN_AUTH_KEY);
  }
}

export function hasMockAdminSession() {
  return typeof window !== 'undefined' && window.localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
}
