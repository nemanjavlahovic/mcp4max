import { AudioEffect } from '../../src/index.js';

// ─── Simple Stereo Delay ───
// A basic delay effect with time, feedback, and mix controls.
// Signal flow: plugin~ → tapin~/tapout~ feedback loop → mix with dry → plugout~

const device = new AudioEffect('Simple Delay');
device.description('Stereo delay with feedback and dry/wet mix');

// ─── Parameters ───
const delayTime = device.param('Delay Time', {
  type: 'dial',
  min: 1,
  max: 2000,
  initial: 250,
  unitstyle: 'time',
});

const feedback = device.param('Feedback', {
  type: 'dial',
  min: 0,
  max: 95,
  initial: 40,
  unitstyle: '%',
});

const mix = device.param('Mix', {
  type: 'dial',
  min: 0,
  max: 100,
  initial: 50,
  unitstyle: '%',
});

// ─── DSP Objects ───
// Left channel delay
const tapinL = device.add('tapin~', '5000');
const tapoutL = device.add('tapout~', '250');

// Right channel delay
const tapinR = device.add('tapin~', '5000');
const tapoutR = device.add('tapout~', '250');

// Feedback multiplier (0-0.95)
const fbScaleL = device.add('*~', '0.4');
const fbScaleR = device.add('*~', '0.4');

// Convert feedback % to 0-0.95 range
const fbScale = device.add('scale', '0 95 0. 0.95');

// Convert delay time to tapout~ message
// tapout~ receives delay time via its inlet

// Dry/wet mixing
const dryScaleL = device.add('*~', '0.5');
const dryScaleR = device.add('*~', '0.5');
const wetScaleL = device.add('*~', '0.5');
const wetScaleR = device.add('*~', '0.5');
const mixL = device.add('+~');
const mixR = device.add('+~');

// Convert mix % to 0-1
const mixScale = device.add('scale', '0 100 0. 1.');
// Invert for dry level: dry = 1 - wet
const dryCalc = device.add('expr', '1. - $f1');

// ─── Connections ───

// Delay time → tapout~ (left inlet controls delay time)
device.connect(delayTime, tapoutL.in(0));
device.connect(delayTime, tapoutR.in(0));

// Feedback param → scale → feedback multipliers
device.connect(feedback, fbScale);
device.connect(fbScale, fbScaleL.in(1));
device.connect(fbScale, fbScaleR.in(1));

// Left channel: plugin~ L → tapin~ → tapout~ → feedback loop
device.connect(device.in(0), tapinL);
device.connect(tapinL, tapoutL);
device.connect(tapoutL, fbScaleL);
device.connect(fbScaleL, tapinL); // feedback loop

// Right channel: plugin~ R → tapin~ → tapout~ → feedback loop
device.connect(device.in(1), tapinR);
device.connect(tapinR, tapoutR);
device.connect(tapoutR, fbScaleR);
device.connect(fbScaleR, tapinR); // feedback loop

// Mix control
device.connect(mix, mixScale);
device.connect(mixScale, wetScaleL.in(1));
device.connect(mixScale, wetScaleR.in(1));
device.connect(mixScale, dryCalc);
device.connect(dryCalc, dryScaleL.in(1));
device.connect(dryCalc, dryScaleR.in(1));

// Dry signal
device.connect(device.in(0), dryScaleL);
device.connect(device.in(1), dryScaleR);

// Wet signal
device.connect(tapoutL, wetScaleL);
device.connect(tapoutR, wetScaleR);

// Sum dry + wet
device.connect(dryScaleL, mixL);
device.connect(wetScaleL, mixL.in(1));
device.connect(dryScaleR, mixR);
device.connect(wetScaleR, mixR.in(1));

// Output
device.connect(mixL, device.out(0));
device.connect(mixR, device.out(1));

// ─── Save ───
device.save();
