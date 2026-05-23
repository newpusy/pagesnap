const fs = require('fs');
const path = require('path');
const os = require('os');
const { watchConfig, stopWatching, isWatching } = require('./watcher');

function writeTempConfig(data) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pagesnap-watcher-'));
  const cfgPath = path.join(tmpDir, 'pagesnap.config.json');
  fs.writeFileSync(cfgPath, JSON.stringify(data));
  return { cfgPath, tmpDir };
}

function cleanup(tmpDir) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

const validConfig = {
  pages: [{ name: 'home', url: 'https://example.com', schedule: '0 * * * *' }],
  outputDir: './snaps'
};

afterEach(() => {
  stopWatching();
});

test('isWatching returns false before watchConfig is called', () => {
  expect(isWatching()).toBe(false);
});

test('watchConfig starts watching and isWatching returns true', () => {
  const { cfgPath, tmpDir } = writeTempConfig(validConfig);
  try {
    watchConfig(cfgPath, () => {});
    expect(isWatching()).toBe(true);
  } finally {
    stopWatching();
    cleanup(tmpDir);
  }
});

test('stopWatching sets isWatching to false', () => {
  const { cfgPath, tmpDir } = writeTempConfig(validConfig);
  try {
    watchConfig(cfgPath, () => {});
    stopWatching();
    expect(isWatching()).toBe(false);
  } finally {
    cleanup(tmpDir);
  }
});

test('onChange callback fires when config file is modified', (done) => {
  const { cfgPath, tmpDir } = writeTempConfig(validConfig);
  const updated = { ...validConfig, outputDir: './updated-snaps' };

  watchConfig(cfgPath, (config) => {
    try {
      expect(config.outputDir).toBe('./updated-snaps');
      done();
    } catch (e) {
      done(e);
    } finally {
      stopWatching();
      cleanup(tmpDir);
    }
  });

  setTimeout(() => {
    fs.writeFileSync(cfgPath, JSON.stringify(updated));
  }, 100);
}, 3000);

test('calling watchConfig twice replaces the previous watcher', () => {
  const { cfgPath: p1, tmpDir: d1 } = writeTempConfig(validConfig);
  const { cfgPath: p2, tmpDir: d2 } = writeTempConfig(validConfig);
  try {
    watchConfig(p1, () => {});
    watchConfig(p2, () => {});
    expect(isWatching()).toBe(true);
  } finally {
    stopWatching();
    cleanup(d1);
    cleanup(d2);
  }
});
