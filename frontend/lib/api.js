export function getToken(){
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function fetchWithToken(path, opts = {}){
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  const token = getToken();
  const headers = opts.headers || {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  return fetch(base + path, { ...opts, headers });
}
