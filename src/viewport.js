// viewport.js — merge and validate viewport config for screenshots

const DEFAULT_VIEWPORT = {
  width: 1280,
  height: 800,
  deviceScaleFactor: 1,
  isMobile: false,
};

const VALID_KEYS = ['width', 'height', 'deviceScaleFactor', 'isMobile'];

function mergeViewportConfig(global = {}, page = {}) {
  return Object.assign({}, DEFAULT_VIEWPORT, global, page);
}

function validateViewport(viewport) {
  const errors = [];

  if (typeof viewport.width !== 'number' || viewport.width < 1 || viewport.width > 7680) {
    errors.push('viewport.width must be a number between 1 and 7680');
  }

  if (typeof viewport.height !== 'number' || viewport.height < 1 || viewport.height > 4320) {
    errors.push('viewport.height must be a number between 1 and 4320');
  }

  if (typeof viewport.deviceScaleFactor !== 'number' || viewport.deviceScaleFactor < 0.1 || viewport.deviceScaleFactor > 4) {
    errors.push('viewport.deviceScaleFactor must be a number between 0.1 and 4');
  }

  if (typeof viewport.isMobile !== 'boolean') {
    errors.push('viewport.isMobile must be a boolean');
  }

  const unknownKeys = Object.keys(viewport).filter(k => !VALID_KEYS.includes(k));
  if (unknownKeys.length > 0) {
    errors.push(`unknown viewport keys: ${unknownKeys.join(', ')}`);
  }

  return errors;
}

function describeViewport(viewport) {
  const v = mergeViewportConfig(viewport);
  const parts = [`${v.width}x${v.height}`];
  if (v.deviceScaleFactor !== 1) parts.push(`@${v.deviceScaleFactor}x`);
  if (v.isMobile) parts.push('(mobile)');
  return parts.join(' ');
}

module.exports = { mergeViewportConfig, validateViewport, describeViewport, DEFAULT_VIEWPORT };
