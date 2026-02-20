import { AudioEffect } from '../../src/index.js';

// ─── Grainy Delay ───
// Stereo delay with LFO-modulated delay times for a diffuse, grainy texture.
// Cross-feedback between L/R channels for stereo spread.
// Feedback path runs through a lowpass filter so repeats darken over time.
//
// Signal flow per channel:
//   input ─→ [+~ fb_return] ─→ tapin~ ─→ tapout~ ─→ wet_out
//                                                  ↓
//                         ←── lores~ ←── *~ fb ←───┘
//   (cross-feedback: L fb goes to R sum, R fb goes to L sum)

const device = new AudioEffect('Grainy Delay');
device.description('Diffuse granular-textured stereo delay');

// ─── Parameters ───
const time = device.param('Time', {
  type: 'dial',
  min: 10,
  max: 1500,
  initial: 300,
  unitstyle: 'time',
});

const modRate = device.param('Rate', {
  type: 'dial',
  min: 0.05,
  max: 5,
  initial: 0.4,
  unitstyle: 'float',
});

const modDepth = device.param('Depth', {
  type: 'dial',
  min: 0,
  max: 25,
  initial: 6,
  unitstyle: 'float',
});

const feedback = device.param('Feedback', {
  type: 'dial',
  min: 0,
  max: 90,
  initial: 40,
  unitstyle: '%',
});

const tone = device.param('Tone', {
  type: 'dial',
  min: 200,
  max: 18000,
  initial: 3500,
  unitstyle: 'hertz',
  exponent: 3,
});

const mix = device.param('Mix', {
  type: 'dial',
  min: 0,
  max: 100,
  initial: 35,
  unitstyle: '%',
});

// ─── LFO modulation ───
// Two LFOs at different rates for L/R — creates the grainy pitch wobble
const lfoL = device.add('cycle~', '0.4');
const lfoR = device.add('cycle~', '0.57');  // slightly different rate for stereo

// Scale LFO by mod depth → outputs ±depth ms of wobble
const depthSig = device.add('sig~');
const lfoScaledL = device.add('*~');
const lfoScaledR = device.add('*~');

// Convert base delay time to signal, then add LFO offset
const timeSig = device.add('sig~');
const delayTimeL = device.add('+~');  // base_time + lfo_offset
const delayTimeR = device.add('+~');

// ─── Delay lines (one per channel) ───
const tapinL = device.add('tapin~', '5000');
const tapoutL = device.add('tapout~', '300');
const tapinR = device.add('tapin~', '5000');
const tapoutR = device.add('tapout~', '300');

// ─── Feedback path ───
// feedback param (0-90%) → scale to 0-0.45 per channel
// (cross-feedback means total loop gain = fb × 2 paths, so halve it)
const fbScale = device.add('scale', '0 90 0. 0.45');
const fbSig = device.add('sig~');

// Feedback multipliers
const fbMulL = device.add('*~');   // tapoutL × fb → feeds into RIGHT channel
const fbMulR = device.add('*~');   // tapoutR × fb → feeds into LEFT channel

// Lowpass filter in feedback path
const fbFilterL = device.add('lores~', '3500 0.15');
const fbFilterR = device.add('lores~', '3500 0.15');

// Sum input + cross-feedback before entering delay
const sumL = device.add('+~');   // dry L + filtered fb from R
const sumR = device.add('+~');   // dry R + filtered fb from L

// ─── Dry/Wet mix ───
const mixScale = device.add('scale', '0 100 0. 1.');
const dryCalc = device.add('expr', '1. - $f1');
const drySigCtl = device.add('sig~');
const wetSigCtl = device.add('sig~');

const dryL = device.add('*~');
const dryR = device.add('*~');
const wetL = device.add('*~');
const wetR = device.add('*~');
const outL = device.add('+~');
const outR = device.add('+~');

// ─── Connections ───

// LFO rate
device.connect(modRate, lfoL);
device.connect(modRate, lfoR);

// LFO × depth
device.connect(modDepth, depthSig);
device.connect(lfoL, lfoScaledL);
device.connect(depthSig, lfoScaledL.in(1));
device.connect(lfoR, lfoScaledR);
device.connect(depthSig, lfoScaledR.in(1));

// Delay time = base + LFO offset
device.connect(time, timeSig);
device.connect(timeSig, delayTimeL);
device.connect(lfoScaledL, delayTimeL.in(1));
device.connect(timeSig, delayTimeR);
device.connect(lfoScaledR, delayTimeR.in(1));

// Feed modulated delay time into tapout~ (inlet 0 sets delay time in signal domain)
device.connect(delayTimeL, tapoutL);
device.connect(delayTimeR, tapoutR);

// Input + cross-feedback sum → tapin
device.connect(device.in(0), sumL);       // dry left
device.connect(device.in(1), sumR);       // dry right
device.connect(sumL, tapinL);
device.connect(sumR, tapinR);

// tapin → tapout (delay buffer connection)
device.connect(tapinL, tapoutL);
device.connect(tapinR, tapoutR);

// Feedback: cross-channel
// tapoutL → fb multiply → filter → sumR (cross to right)
// tapoutR → fb multiply → filter → sumL (cross to left)
device.connect(feedback, fbScale);
device.connect(fbScale, fbSig);

device.connect(tapoutL, fbMulL);
device.connect(fbSig, fbMulL.in(1));
device.connect(fbMulL, fbFilterL);
device.connect(tone, fbFilterL.in(1));
device.connect(fbFilterL, sumR);          // L feedback → R input

device.connect(tapoutR, fbMulR);
device.connect(fbSig, fbMulR.in(1));
device.connect(fbMulR, fbFilterR);
device.connect(tone, fbFilterR.in(1));
device.connect(fbFilterR, sumL);          // R feedback → L input

// Dry/wet mix
device.connect(mix, mixScale);
device.connect(mixScale, wetSigCtl);
device.connect(mixScale, dryCalc);
device.connect(dryCalc, drySigCtl);

device.connect(device.in(0), dryL);
device.connect(drySigCtl, dryL.in(1));
device.connect(device.in(1), dryR);
device.connect(drySigCtl, dryR.in(1));

device.connect(tapoutL, wetL);
device.connect(wetSigCtl, wetL.in(1));
device.connect(tapoutR, wetR);
device.connect(wetSigCtl, wetR.in(1));

device.connect(dryL, outL);
device.connect(wetL, outL.in(1));
device.connect(dryR, outR);
device.connect(wetR, outR.in(1));

device.connect(outL, device.out(0));
device.connect(outR, device.out(1));

// ─── Save ───
device.save();
