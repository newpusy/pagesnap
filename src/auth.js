// auth.js — per-page HTTP basic auth and bearer token support

const DEFAULT_AUTH = {
  type: null, // 'basic' | 'bearer'
  username: null,
  password: null,
  token: null,
};

function mergeAuthConfig(global = {}, page = {}) {
  return Object.assign({}, DEFAULT_AUTH, global.auth || {}, page.auth || {});
}

function validateAuth(auth) {
  if (!auth || !auth.type) return null;
  if (auth.type === 'basic') {
    if (!auth.username || !auth.password) {
      throw new Error('auth.type "basic" requires username and password');
    }
    return auth;
  }
  if (auth.type === 'bearer') {
    if (!auth.token) {
      throw new Error('auth.type "bearer" requires a token');
    }
    return auth;
  }
  throw new Error(`Unknown auth.type: "${auth.type}"`);
}

function buildAuthHeaders(auth) {
  if (!auth || !auth.type) return {};
  if (auth.type === 'basic') {
    const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
    return { Authorization: `Basic ${encoded}` };
  }
  if (auth.type === 'bearer') {
    return { Authorization: `Bearer ${auth.token}` };
  }
  return {};
}

function describeAuth(auth) {
  if (!auth || !auth.type) return 'none';
  if (auth.type === 'basic') return `basic (user: ${auth.username})`;
  if (auth.type === 'bearer') return 'bearer token';
  return 'unknown';
}

module.exports = { mergeAuthConfig, validateAuth, buildAuthHeaders, describeAuth };
