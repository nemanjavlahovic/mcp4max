import { MIDIEffect } from '../../src/index.js';

// ─── MIDI Echo ───
// Repeats incoming MIDI notes with configurable delay and velocity decay.
// Each repeat is quieter than the last.

const device = new MIDIEffect('MIDI Echo');
device.description('MIDI note echo with velocity decay');

// ─── Parameters ───
const echoDelay = device.param('Delay', {
  type: 'dial',
  min: 50,
  max: 2000,
  initial: 250,
  unitstyle: 'time',
});

const repeats = device.param('Repeats', {
  type: 'dial',
  min: 1,
  max: 8,
  initial: 3,
  unitstyle: 'int',
  steps: 8,
});

const decay = device.param('Decay', {
  type: 'dial',
  min: 10,
  max: 100,
  initial: 70,
  unitstyle: '%',
});

// ─── MIDI Processing ───
// Parse MIDI into note/velocity/channel
const midiparse = device.add('midiparse');
const midiformat = device.add('midiformat');

// Note pipeline: pipe delays note+velocity pairs (3 args = 3 inlets, 3 outlets)
const pipeSpec = { numinlets: 3, numoutlets: 3, outlettype: ['', '', ''] };
const pipe1 = device.add('pipe', '0 0 250', pipeSpec);
const pipe2 = device.add('pipe', '0 0 500', pipeSpec);
const pipe3 = device.add('pipe', '0 0 750', pipeSpec);

// Velocity scaling for each echo
const velScale1 = device.add('*', '0.7');
const velScale2 = device.add('*', '0.49');
const velScale3 = device.add('*', '0.343');

// Makenote to handle note-offs for echoes
const makenote1 = device.add('makenote', '64 250');
const makenote2 = device.add('makenote', '64 250');
const makenote3 = device.add('makenote', '64 250');

// ─── Connections ───

// Input → parse
device.connect(device.in(0), midiparse);

// Pass through original notes
device.connect(midiparse, midiformat);                // note
device.connect(midiparse.out(1), midiformat.in(1));   // velocity

// Echo 1: note+vel through pipe, velocity scaled
device.connect(midiparse, pipe1);
device.connect(midiparse.out(1), velScale1);
device.connect(velScale1, pipe1.in(1));
device.connect(pipe1, makenote1);
device.connect(pipe1.out(1), makenote1.in(1));
device.connect(makenote1, midiformat);
device.connect(makenote1.out(1), midiformat.in(1));

// Echo 2
device.connect(midiparse, pipe2);
device.connect(midiparse.out(1), velScale2);
device.connect(velScale2, pipe2.in(1));
device.connect(pipe2, makenote2);
device.connect(pipe2.out(1), makenote2.in(1));
device.connect(makenote2, midiformat);
device.connect(makenote2.out(1), midiformat.in(1));

// Echo 3
device.connect(midiparse, pipe3);
device.connect(midiparse.out(1), velScale3);
device.connect(velScale3, pipe3.in(1));
device.connect(pipe3, makenote3);
device.connect(pipe3.out(1), makenote3.in(1));
device.connect(makenote3, midiformat);
device.connect(makenote3.out(1), midiformat.in(1));

// Output formatted MIDI
device.connect(midiformat, device.out(0));

// ─── Save ───
device.save();
