# mcp4max

Programmatic Max for Live device generation. Describe a device in TypeScript, run the script, get a `.maxpat` file you can drag straight into Ableton Live.

## Why

Max for Live patches are JSON under the hood (`.maxpat` format). This library lets you generate them from code instead of wiring boxes by hand. Useful for:

- Rapidly prototyping audio effects, MIDI processors, and instruments
- Generating parametric device variations
- Scripting complex patches that would be tedious to build visually

## Install

```bash
git clone https://github.com/nemanjavlahovic/mcp4max.git
cd mcp4max
npm install
```

Requires Node.js 18+ and Ableton Live with Max for Live.

## Quick Start

```typescript
import { AudioEffect } from './src/index.js';

const device = new AudioEffect('My Effect');

// Add a parameter (appears as a dial in the device UI)
const mix = device.param('Mix', {
  type: 'dial', min: 0, max: 100, initial: 50, unitstyle: '%'
});

// Add DSP objects
const mul = device.add('*~', '0.5');

// Wire it up
device.connect(device.in(0), mul);      // left input → multiply
device.connect(mul, device.out(0));     // multiply → left output
device.connect(device.in(1), device.out(1)); // right passthrough

device.save();
```

```bash
npx tsx my-effect.ts
# → Saved to ~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/My Effect.maxpat
```

Open Ableton, find "My Effect" in your User Library, drag it onto a track.

## Device Types

```typescript
import { AudioEffect, MIDIEffect, Instrument } from './src/index.js';

new AudioEffect('name')   // plugin~ / plugout~ (stereo audio I/O)
new MIDIEffect('name')    // midiin / midiout
new Instrument('name')    // midiin + plugout~ (MIDI in, audio out)
```

## API

### Adding Objects

```typescript
const obj = device.add('cycle~', '440');           // oscillator at 440Hz
const filt = device.add('lores~', '2000 0.5');     // lowpass filter

// Override inlet/outlet count for variable-arg objects
const pipe = device.add('pipe', '0 0 250', {
  numinlets: 3, numoutlets: 3, outlettype: ['', '', '']
});
```

### Connections

```typescript
device.connect(a, b);              // outlet 0 → inlet 0
device.connect(a.out(1), b);       // outlet 1 → inlet 0
device.connect(a, b.in(1));        // outlet 0 → inlet 1
device.chain(a, b, c);             // a→b→c (outlet 0 → inlet 0)
```

For device I/O, `device.in(n)` and `device.out(n)` return connection endpoints targeting the plugin~/plugout~ ports:

```typescript
device.connect(device.in(0), myObj);    // left channel input
device.connect(device.in(1), myObj);    // right channel input
device.connect(myObj, device.out(0));   // left channel output
```

### Parameters

Parameters create `live.dial`, `live.slider`, etc. with full Ableton parameter integration:

```typescript
const cutoff = device.param('Cutoff', {
  type: 'dial',
  min: 20, max: 20000,
  initial: 5000,
  unitstyle: 'hertz',
  exponent: 3,
});

const mode = device.param('Mode', {
  type: 'menu',
  enum: ['LP', 'HP', 'BP'],
  initial: 0,
});

const enabled = device.param('Enabled', { type: 'toggle', initial: 1 });
```

Available types: `dial`, `slider`, `menu`, `toggle`, `button`, `tab`, `numbox`

A `Param` connects like a `Box` — outlet 0 is the formatted value, outlet 1 is the raw 0–1 float:

```typescript
device.connect(cutoff, filter.in(1));        // formatted value
device.connect(cutoff.raw, someObj.in(0));   // raw 0-1
```

### Saving

```typescript
device.save();                                    // default: Ableton User Library
device.save({ filename: 'custom.amxd' });         // custom filename
device.save({ outputDir: '/path/to/folder' });    // custom directory
```

Default output paths:
- Audio Effects → `~/Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect/`
- MIDI Effects → `~/Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect/`
- Instruments → `~/Music/Ableton/User Library/Presets/Instruments/Max Instrument/`

### Utilities

```typescript
device.comment('This is a comment');
device.message('bang');
device.description('My cool effect');
device.toJSON();  // serialize without saving to disk
```

## CLI

```bash
npx tsx bin/m4l.ts build <file.ts>       # build a single device
npx tsx bin/m4l.ts build <directory>     # build all .ts files in a directory
npx tsx bin/m4l.ts init <name> [type]    # scaffold a new device (audio|midi|instrument)
npx tsx bin/m4l.ts list                  # list all 153 registered Max objects
```

## Examples

Four complete examples in `devices/examples/`:

| Example | Type | What it does |
|---------|------|-------------|
| `simple-delay.ts` | AudioEffect | Stereo delay with time, feedback, and dry/wet mix |
| `grainy-delay.ts` | AudioEffect | Diffuse stereo delay with LFO-modulated times and cross-feedback |
| `midi-echo.ts` | MIDIEffect | MIDI note echo with velocity decay |
| `basic-synth.ts` | Instrument | Monophonic saw → filter → ADSR subtractive synth |

Run them:

```bash
npx tsx devices/examples/simple-delay.ts
npx tsx devices/examples/grainy-delay.ts
npx tsx devices/examples/midi-echo.ts
npx tsx devices/examples/basic-synth.ts
```

## Object Registry

153 common Max objects are registered with correct inlet/outlet counts and types. Categories include:

- **Audio I/O**: `plugin~`, `plugout~`, `adc~`, `dac~`
- **MIDI**: `midiin`, `midiout`, `notein`, `noteout`, `midiparse`, `midiformat`
- **DSP**: `tapin~`, `tapout~`, `lores~`, `svf~`, `biquad~`, `allpass~`, `comb~`
- **Oscillators**: `cycle~`, `saw~`, `rect~`, `tri~`, `phasor~`, `noise~`
- **Envelopes**: `adsr~`, `line~`, `curve~`, `function`
- **Math**: `+~`, `*~`, `scale`, `expr`, `clip`
- **Routing**: `gate`, `select`, `route`, `trigger`, `pack`, `unpack`
- **M4L UI**: `live.dial`, `live.slider`, `live.menu`, `live.toggle`, `live.button`, `live.tab`
- **Data**: `buffer~`, `groove~`, `coll`, `dict`, `table`

Unknown objects fall back to 1-in/1-out with a console warning. Override with `specOverride`:

```typescript
device.add('my.external~', '0', { numinlets: 3, numoutlets: 2, outlettype: ['signal', 'signal'] });
```

## Auto-Layout

Patches are automatically laid out:

- **Patching view**: Topological sort into columns. Parameters on the left, DSP logic flowing left-to-right.
- **Presentation view**: Parameters arranged horizontally. `devicewidth` set automatically.

## How It Works

The library builds an in-memory graph of Max objects and connections, then serializes it to `.amxd` — the native Max for Live device format. The output includes the required binary header so Ableton recognizes it immediately in the User Library browser.

Devices can be dragged directly onto tracks in Ableton Live. Open in the Max editor to inspect or modify the patch visually. To freeze the device (embed dependencies), use Max's "Freeze" option.

## License

MIT
