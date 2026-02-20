import type { ObjectSpec } from './types.js';

// Outlet type constants
const SIG = 'signal';
const MSG = '';
const BANG = 'bang';
const INT = 'int';
const FLOAT = 'float';
const LIST = 'list';
const MULTI = 'multichannelsignal';

const registry = new Map<string, ObjectSpec>();

function reg(name: string, spec: ObjectSpec): void {
  registry.set(name, spec);
}

// ─── Audio I/O ───
reg('plugin~', { numinlets: 2, numoutlets: 2, outlettype: [SIG, SIG] });
reg('plugout~', { numinlets: 2, numoutlets: 0, outlettype: [] });
reg('adc~', { numinlets: 1, numoutlets: 2, outlettype: [SIG, SIG] });
reg('dac~', { numinlets: 2, numoutlets: 0, outlettype: [] });
reg('mc.plugin~', { numinlets: 1, numoutlets: 1, outlettype: [MULTI] });
reg('mc.plugout~', { numinlets: 1, numoutlets: 0, outlettype: [] });

// ─── MIDI I/O ───
reg('midiin', { numinlets: 1, numoutlets: 1, outlettype: [INT] });
reg('midiout', { numinlets: 1, numoutlets: 0, outlettype: [] });
reg('notein', { numinlets: 1, numoutlets: 3, outlettype: [INT, INT, INT] });
reg('noteout', { numinlets: 3, numoutlets: 0, outlettype: [] });
reg('ctlin', { numinlets: 1, numoutlets: 3, outlettype: [INT, INT, INT] });
reg('ctlout', { numinlets: 3, numoutlets: 0, outlettype: [] });
reg('pgmin', { numinlets: 1, numoutlets: 2, outlettype: [INT, INT] });
reg('pgmout', { numinlets: 2, numoutlets: 0, outlettype: [] });
reg('bendin', { numinlets: 1, numoutlets: 2, outlettype: [INT, INT] });
reg('bendout', { numinlets: 2, numoutlets: 0, outlettype: [] });
reg('makenote', { numinlets: 3, numoutlets: 2, outlettype: [INT, INT] });
reg('stripnote', { numinlets: 2, numoutlets: 2, outlettype: [INT, INT] });
reg('midiparse', { numinlets: 1, numoutlets: 7, outlettype: [MSG, MSG, MSG, MSG, MSG, MSG, MSG] });
reg('midiformat', { numinlets: 7, numoutlets: 1, outlettype: [INT] });
reg('flush', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('borax', { numinlets: 1, numoutlets: 8, outlettype: [INT, INT, INT, INT, INT, INT, INT, INT] });

// ─── Audio Effects / DSP ───
reg('delay~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('tapin~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('tapout~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('*~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('+~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('-~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('/~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('clip~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('abs~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('avg~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('biquad~', { numinlets: 6, numoutlets: 1, outlettype: [SIG] });
reg('cascade~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('filtercoeff~', { numinlets: 6, numoutlets: 6, outlettype: [SIG, SIG, SIG, SIG, SIG, SIG] });
reg('svf~', { numinlets: 3, numoutlets: 4, outlettype: [SIG, SIG, SIG, SIG] });
reg('lores~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('reson~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('onepole~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('allpass~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('comb~', { numinlets: 4, numoutlets: 1, outlettype: [SIG] });

// ─── Oscillators / Generators ───
reg('cycle~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('saw~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('rect~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('tri~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('phasor~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('noise~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('pink~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });

// ─── Envelopes / Ramps ───
reg('adsr~', { numinlets: 5, numoutlets: 4, outlettype: [SIG, SIG, BANG, MSG] });
reg('line~', { numinlets: 2, numoutlets: 2, outlettype: [SIG, BANG] });
reg('curve~', { numinlets: 3, numoutlets: 2, outlettype: [SIG, BANG] });
reg('function', { numinlets: 1, numoutlets: 4, outlettype: [FLOAT, MSG, BANG, MSG], maxclass: 'newobj' });

// ─── Amplitude / Mixing ───
reg('gain~', { numinlets: 2, numoutlets: 2, outlettype: [SIG, INT], maxclass: 'gain~', defaultWidth: 22 });
reg('meter~', { numinlets: 1, numoutlets: 1, outlettype: [FLOAT], maxclass: 'meter~' });
reg('levelmeter~', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'levelmeter~' });

// ─── Conversion ───
reg('mtof', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('ftom', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('mtof~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('ftom~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('atodb', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('dbtoa', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('atodb~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('dbtoa~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('sig~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('snapshot~', { numinlets: 2, numoutlets: 1, outlettype: [FLOAT] });
reg('number~', { numinlets: 2, numoutlets: 2, outlettype: [SIG, BANG], maxclass: 'number~' });

// ─── Math (message domain) ───
reg('+', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('-', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('*', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('/', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('%', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('expr', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('scale', { numinlets: 6, numoutlets: 1, outlettype: [MSG] });
reg('clip', { numinlets: 3, numoutlets: 1, outlettype: [MSG] });
reg('split', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });
reg('random', { numinlets: 2, numoutlets: 1, outlettype: [INT] });

// ─── Routing / Logic ───
reg('gate', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('gate~', { numinlets: 2, numoutlets: 1, outlettype: [SIG] });
reg('switch', { numinlets: 3, numoutlets: 1, outlettype: [MSG] });
reg('select', { numinlets: 1, numoutlets: 2, outlettype: [BANG, MSG] });
reg('route', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });
reg('trigger', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });
reg('pack', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('unpack', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });
reg('swap', { numinlets: 2, numoutlets: 2, outlettype: [MSG, MSG] });
reg('if', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });

// ─── Timing ───
reg('metro', { numinlets: 2, numoutlets: 1, outlettype: [BANG] });
reg('delay', { numinlets: 2, numoutlets: 1, outlettype: [BANG] });
reg('pipe', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('timer', { numinlets: 2, numoutlets: 1, outlettype: [FLOAT] });
reg('clocker', { numinlets: 2, numoutlets: 1, outlettype: [FLOAT] });
reg('line', { numinlets: 2, numoutlets: 2, outlettype: [MSG, BANG] });
reg('counter', { numinlets: 5, numoutlets: 4, outlettype: [INT, INT, INT, INT] });
reg('transport', { numinlets: 1, numoutlets: 5, outlettype: [INT, INT, FLOAT, FLOAT, FLOAT] });

// ─── Data Storage ───
reg('int', { numinlets: 2, numoutlets: 1, outlettype: [INT] });
reg('float', { numinlets: 2, numoutlets: 1, outlettype: [FLOAT] });
reg('value', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('table', { numinlets: 2, numoutlets: 2, outlettype: [INT, BANG] });
reg('coll', { numinlets: 1, numoutlets: 4, outlettype: [MSG, MSG, MSG, BANG] });
reg('dict', { numinlets: 2, numoutlets: 4, outlettype: [MSG, MSG, MSG, MSG] });
reg('buffer~', { numinlets: 1, numoutlets: 2, outlettype: [FLOAT, BANG] });
reg('groove~', { numinlets: 3, numoutlets: 3, outlettype: [SIG, SIG, SIG] });
reg('play~', { numinlets: 2, numoutlets: 2, outlettype: [SIG, BANG] });
reg('record~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('waveform~', { numinlets: 5, numoutlets: 4, outlettype: [FLOAT, FLOAT, FLOAT, FLOAT], maxclass: 'waveform~' });

// ─── UI Objects ───
reg('number', { numinlets: 1, numoutlets: 2, outlettype: [MSG, BANG], maxclass: 'number' });
reg('flonum', { numinlets: 1, numoutlets: 2, outlettype: [MSG, BANG], maxclass: 'flonum' });
reg('slider', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'slider' });
reg('toggle', { numinlets: 1, numoutlets: 1, outlettype: [INT], maxclass: 'toggle' });
reg('button', { numinlets: 1, numoutlets: 1, outlettype: [BANG], maxclass: 'button' });
reg('message', { numinlets: 2, numoutlets: 1, outlettype: [MSG], maxclass: 'message' });
reg('comment', { numinlets: 1, numoutlets: 0, outlettype: [], maxclass: 'comment' });
reg('bang', { numinlets: 1, numoutlets: 1, outlettype: [BANG], maxclass: 'button' });

// ─── Max for Live Specific ───
reg('live.dial', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG], maxclass: 'live.dial', defaultWidth: 44 });
reg('live.slider', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG], maxclass: 'live.slider', defaultWidth: 40 });
reg('live.menu', { numinlets: 1, numoutlets: 3, outlettype: [MSG, MSG, MSG], maxclass: 'live.menu', defaultWidth: 100 });
reg('live.toggle', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'live.toggle', defaultWidth: 15 });
reg('live.button', { numinlets: 1, numoutlets: 1, outlettype: [BANG], maxclass: 'live.button', defaultWidth: 15 });
reg('live.tab', { numinlets: 1, numoutlets: 3, outlettype: [MSG, MSG, MSG], maxclass: 'live.tab', defaultWidth: 100 });
reg('live.numbox', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG], maxclass: 'live.numbox', defaultWidth: 44 });
reg('live.text', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG], maxclass: 'live.text', defaultWidth: 44 });
reg('live.gain~', { numinlets: 2, numoutlets: 5, outlettype: [SIG, MSG, FLOAT, MSG, MSG], maxclass: 'live.gain~', defaultWidth: 48 });
reg('live.meter~', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'live.meter~' });
reg('live.scope~', { numinlets: 3, numoutlets: 1, outlettype: [MSG], maxclass: 'live.scope~' });
reg('live.thisdevice', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'live.thisdevice' });
reg('live.object', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('live.path', { numinlets: 1, numoutlets: 6, outlettype: [MSG, MSG, MSG, MSG, MSG, MSG] });
reg('live.observer', { numinlets: 2, numoutlets: 3, outlettype: [MSG, MSG, MSG] });
reg('live.remote~', { numinlets: 2, numoutlets: 0, outlettype: [] });

// ─── MSP Utilities ───
reg('selector~', { numinlets: 3, numoutlets: 1, outlettype: [SIG] });
reg('matrix~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('send~', { numinlets: 1, numoutlets: 0, outlettype: [] });
reg('receive~', { numinlets: 1, numoutlets: 1, outlettype: [SIG] });
reg('send', { numinlets: 1, numoutlets: 0, outlettype: [] });
reg('receive', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('loadbang', { numinlets: 1, numoutlets: 1, outlettype: [BANG] });
reg('closebang', { numinlets: 1, numoutlets: 1, outlettype: [BANG] });
reg('deferlow', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('append', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('prepend', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('thresh', { numinlets: 2, numoutlets: 1, outlettype: [LIST] });
reg('speedlim', { numinlets: 2, numoutlets: 1, outlettype: [MSG] });
reg('change', { numinlets: 1, numoutlets: 2, outlettype: [MSG, BANG] });
reg('past', { numinlets: 2, numoutlets: 1, outlettype: [BANG] });
reg('minimum', { numinlets: 2, numoutlets: 2, outlettype: [MSG, MSG] });
reg('maximum', { numinlets: 2, numoutlets: 2, outlettype: [MSG, MSG] });
reg('drunk', { numinlets: 3, numoutlets: 1, outlettype: [INT] });

// ─── Poly / Subpatchers ───
reg('poly~', { numinlets: 1, numoutlets: 2, outlettype: [SIG, MSG] });
reg('thispoly~', { numinlets: 1, numoutlets: 2, outlettype: [MSG, INT] });
reg('patcher', { numinlets: 1, numoutlets: 1, outlettype: [MSG] });
reg('bpatcher', { numinlets: 1, numoutlets: 1, outlettype: [MSG], maxclass: 'bpatcher' });

// ─── Jitter (basics) ───
reg('jit.matrix', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG] });
reg('jit.pwindow', { numinlets: 1, numoutlets: 2, outlettype: [MSG, MSG], maxclass: 'jit.pwindow' });

export function getObjectSpec(name: string): ObjectSpec | undefined {
  return registry.get(name);
}

export function registerObject(name: string, spec: ObjectSpec): void {
  registry.set(name, spec);
}

export function hasObject(name: string): boolean {
  return registry.has(name);
}

export function listObjects(): string[] {
  return Array.from(registry.keys()).sort();
}

const DEFAULT_SPEC: ObjectSpec = {
  numinlets: 1,
  numoutlets: 1,
  outlettype: [''],
};

export function getObjectSpecOrDefault(name: string): ObjectSpec {
  const spec = registry.get(name);
  if (!spec) {
    console.warn(`[mcp4max] Unknown object "${name}" — using default 1-in/1-out spec`);
    return { ...DEFAULT_SPEC };
  }
  return spec;
}
