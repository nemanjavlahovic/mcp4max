import { Instrument } from '../../src/index.js';

// ─── Basic Subtractive Synth ───
// Simple monophonic synth: saw oscillator → low-pass filter → VCA with ADSR.
// MIDI note controls pitch, velocity controls amplitude.

const device = new Instrument('Basic Synth');
device.description('Simple subtractive synthesizer');

// ─── Parameters ───
const cutoff = device.param('Cutoff', {
  type: 'dial',
  min: 20,
  max: 20000,
  initial: 5000,
  unitstyle: 'hertz',
  exponent: 3,
});

const resonance = device.param('Resonance', {
  type: 'dial',
  min: 0,
  max: 100,
  initial: 20,
  unitstyle: '%',
});

const attack = device.param('Attack', {
  type: 'dial',
  min: 1,
  max: 5000,
  initial: 10,
  unitstyle: 'time',
});

const release = device.param('Release', {
  type: 'dial',
  min: 1,
  max: 5000,
  initial: 200,
  unitstyle: 'time',
});

const volume = device.param('Volume', {
  type: 'dial',
  min: -70,
  max: 6,
  initial: -6,
  unitstyle: 'decibel',
});

// ─── MIDI Input Processing ───
// Parse MIDI to get note number and velocity
const midiparse = device.add('midiparse');
const stripnote = device.add('stripnote');
const mtof = device.add('mtof~');

// Velocity → amplitude scaling
const velScale = device.add('scale', '0 127 0. 1.');

// ─── Oscillator ───
const saw = device.add('saw~');

// ─── Filter ───
// Resonance: scale 0-100 to 0-1 for lores~
const resScale = device.add('scale', '0 100 0. 1.');
const filter = device.add('lores~', '5000 0.5');

// ─── Envelope ───
const adsr = device.add('adsr~', '10 50 0.7 200');

// ─── VCA (amplitude) ───
const vca = device.add('*~');

// ─── Output volume ───
const dbtoa = device.add('dbtoa~');
const volMul = device.add('*~');

// ─── Connections ───

// MIDI in → parse → note number → mtof → saw
device.connect(device.in(0), midiparse);
device.connect(midiparse, stripnote);         // note
device.connect(midiparse.out(1), stripnote.in(1)); // velocity
device.connect(stripnote, mtof);
device.connect(mtof, saw);

// Velocity → ADSR trigger
// stripnote outputs: note (0), velocity (1) — velocity > 0 = note on
device.connect(stripnote.out(1), velScale);
device.connect(velScale, adsr);  // trigger adsr with velocity

// Note-off: when stripnote filters a note-off, we need to send 0 to adsr
// stripnote only outputs non-zero velocity, so note-offs are handled
// by sending a 0 message to adsr inlet
const noteOffTrigger = device.add('select', '0');
device.connect(midiparse.out(1), noteOffTrigger); // raw velocity
device.connect(noteOffTrigger, adsr);  // bang on velocity 0

// Attack/Release params → adsr
device.connect(attack, adsr.in(1));  // attack time
device.connect(release, adsr.in(4)); // release time

// Saw → Filter → VCA
device.connect(saw, filter);
device.connect(cutoff, filter.in(1));     // cutoff frequency
device.connect(resonance, resScale);
device.connect(resScale, filter.in(2));   // resonance

device.connect(filter, vca);
device.connect(adsr, vca.in(1));          // envelope → VCA

// Volume control
device.connect(volume, dbtoa);
device.connect(dbtoa, volMul.in(1));
device.connect(vca, volMul);

// Output to both channels (mono → stereo)
device.connect(volMul, device.out(0));
device.connect(volMul, device.out(1));

// ─── Save ───
device.save();
