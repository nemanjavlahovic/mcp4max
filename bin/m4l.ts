#!/usr/bin/env npx tsx
import { existsSync, readdirSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { execSync } from 'node:child_process';
import { listObjects } from '../src/index.js';

const [, , command, ...args] = process.argv;

function usage(): void {
  console.log(`
mcp4max CLI

Usage:
  m4l build <file.ts>       Build a device script into .maxpat
  m4l build <dir>           Build all .ts files in a directory
  m4l init <name> [type]    Scaffold a new device script (type: audio|midi|instrument)
  m4l list                  List all registered Max objects
  m4l help                  Show this help message
`);
}

function build(target: string): void {
  const resolved = resolve(target);

  if (!existsSync(resolved)) {
    console.error(`Error: "${target}" not found`);
    process.exit(1);
  }

  // Check if directory — build all .ts files
  const stat = statSync(resolved);
  const files = stat.isDirectory()
    ? readdirSync(resolved)
        .filter((f: string) => f.endsWith('.ts'))
        .map((f: string) => join(resolved, f))
    : [resolved];

  for (const file of files) {
    console.log(`Building ${basename(file)}...`);
    try {
      execSync(`npx tsx "${file}"`, { stdio: 'inherit' });
    } catch {
      console.error(`Failed to build ${basename(file)}`);
      process.exit(1);
    }
  }
}

function init(name: string, type: string = 'audio'): void {
  const deviceClass =
    type === 'midi'
      ? 'MIDIEffect'
      : type === 'instrument'
        ? 'Instrument'
        : 'AudioEffect';

  const template = `import { ${deviceClass} } from '../src/index.js';

const device = new ${deviceClass}('${name}');
device.description('${name} — created with mcp4max');

// Add parameters
// const mix = device.param('Mix', { type: 'dial', min: 0, max: 100, initial: 50, unitstyle: '%' });

// Add DSP objects
// const obj = device.add('*~', '0.5');

// Connect signal chain
// device.connect(device.in(0), obj);
// device.connect(obj, device.out(0));

device.save();
`;

  const dir = resolve('devices');
  mkdirSync(dir, { recursive: true });
  const filePath = join(dir, `${name}.ts`);
  writeFileSync(filePath, template, 'utf-8');
  console.log(`Created ${filePath}`);
  console.log(`Edit the file, then run: npx tsx ${filePath}`);
}

function listAllObjects(): void {
  const objects = listObjects();
  console.log(`Registered Max objects (${objects.length}):\n`);

  const cols = 4;
  const colWidth = 20;
  for (let i = 0; i < objects.length; i += cols) {
    const row = objects.slice(i, i + cols);
    console.log(row.map((o) => o.padEnd(colWidth)).join(''));
  }
}

switch (command) {
  case 'build':
    if (!args[0]) {
      console.error('Error: specify a file or directory to build');
      process.exit(1);
    }
    build(args[0]);
    break;

  case 'init':
    if (!args[0]) {
      console.error('Error: specify a device name');
      process.exit(1);
    }
    init(args[0], args[1]);
    break;

  case 'list':
    listAllObjects();
    break;

  case 'help':
  case undefined:
    usage();
    break;

  default:
    console.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
}
