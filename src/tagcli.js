// tagcli.js — CLI for tagging snapshots with labels

const fs = require('fs');
const path = require('path');
const { listSnapshotFiles } = require('./cleaner');

const TAGS_FILE = process.env.TAGS_FILE || 'data/tags.json';

function loadTags() {
  if (!fs.existsSync(TAGS_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(TAGS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveTags(tags) {
  const dir = path.dirname(TAGS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(TAGS_FILE, JSON.stringify(tags, null, 2));
}

function addTag(snapshotFile, tag) {
  if (!snapshotFile || !tag) throw new Error('snapshot file and tag are required');
  const tags = loadTags();
  if (!tags[snapshotFile]) tags[snapshotFile] = [];
  if (!tags[snapshotFile].includes(tag)) {
    tags[snapshotFile].push(tag);
  }
  saveTags(tags);
  return tags[snapshotFile];
}

function removeTag(snapshotFile, tag) {
  const tags = loadTags();
  if (!tags[snapshotFile]) return [];
  tags[snapshotFile] = tags[snapshotFile].filter(t => t !== tag);
  if (tags[snapshotFile].length === 0) delete tags[snapshotFile];
  saveTags(tags);
  return tags[snapshotFile] || [];
}

function listTags(snapshotFile) {
  const tags = loadTags();
  return snapshotFile ? (tags[snapshotFile] || []) : tags;
}

function parseCliArgs(argv) {
  const [,, command, ...rest] = argv;
  return { command, args: rest };
}

function runTagCli(argv = process.argv) {
  const { command, args } = parseCliArgs(argv);
  if (command === 'add') {
    const [file, tag] = args;
    const result = addTag(file, tag);
    console.log(`Tagged ${file}: [${result.join(', ')}]`);
  } else if (command === 'remove') {
    const [file, tag] = args;
    const result = removeTag(file, tag);
    console.log(`Tags for ${file}: [${result.join(', ')}]`);
  } else if (command === 'list') {
    const [file] = args;
    const result = listTags(file);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.error('Usage: tagcli <add|remove|list> [file] [tag]');
    process.exit(1);
  }
}

module.exports = { loadTags, saveTags, addTag, removeTag, listTags, parseCliArgs, runTagCli };
