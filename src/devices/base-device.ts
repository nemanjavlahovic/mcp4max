import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { Box, resetBoxCounter } from '../core/box.js';
import { Patcher } from '../core/patcher.js';
import { getObjectSpecOrDefault } from '../core/object-registry.js';
import { Param } from '../params/live-params.js';
import type {
  ConnectionEndpoint,
  DeviceType,
  ObjectSpec,
  ParamOptions,
  SaveOptions,
} from '../core/types.js';
import { layoutPatching } from '../layout/patching.js';
import { layoutPresentation } from '../layout/presentation.js';

// Output paths for Ableton User Library
const ABLETON_PATHS: Record<DeviceType, string> = {
  audio_effect: 'Music/Ableton/User Library/Presets/Audio Effects/Max Audio Effect',
  midi_effect: 'Music/Ableton/User Library/Presets/MIDI Effects/Max MIDI Effect',
  instrument: 'Music/Ableton/User Library/Presets/Instruments/Max Instrument',
};

export abstract class BaseDevice {
  readonly patcher: Patcher;
  readonly params: Param[] = [];
  readonly boxes: Box[] = [];
  abstract readonly deviceType: DeviceType;
  protected _name: string;
  protected _description = '';
  private _hasThisDevice = false;

  constructor(name: string) {
    resetBoxCounter();
    this._name = name;
    this.patcher = new Patcher();
  }

  /** Add a Max object to the device. Returns a Box for connecting. */
  add(objectName: string, args?: string, specOverride?: Partial<ObjectSpec>): Box {
    let spec = getObjectSpecOrDefault(objectName);
    if (specOverride) {
      spec = { ...spec, ...specOverride };
    }
    const box = new Box(objectName, spec, args);
    this.patcher.addBox(box);
    this.boxes.push(box);
    return box;
  }

  /** Add a comment box */
  comment(text: string): Box {
    const spec = getObjectSpecOrDefault('comment');
    const box = new Box('comment', spec, '', { text });
    this.patcher.addBox(box);
    this.boxes.push(box);
    return box;
  }

  /** Add a message box */
  message(text: string): Box {
    const spec = getObjectSpecOrDefault('message');
    const box = new Box('message', spec, '', { text });
    this.patcher.addBox(box);
    this.boxes.push(box);
    return box;
  }

  /** Add a live parameter (dial, slider, menu, toggle, etc.) */
  param(name: string, options: ParamOptions): Param {
    const p = new Param(name, options);
    this.patcher.addBox(p.box);
    this.boxes.push(p.box);
    this.params.push(p);
    return p;
  }

  /** Connect two boxes/endpoints. Accepts Box, Param, or ConnectionEndpoint. */
  connect(
    source: Box | Param | ConnectionEndpoint,
    dest: Box | Param | ConnectionEndpoint,
  ): void {
    const src = this._resolveEndpoint(source, 'out');
    const dst = this._resolveEndpoint(dest, 'in');
    this.patcher.addLine([src.boxId, src.port], [dst.boxId, dst.port]);
  }

  /** Chain multiple boxes in series (outlet 0 → inlet 0) */
  chain(...items: (Box | Param)[]): void {
    for (let i = 0; i < items.length - 1; i++) {
      this.connect(items[i], items[i + 1]);
    }
  }

  /** Get the device's audio/MIDI input endpoint. Override in subclasses. */
  abstract in(channel: number): ConnectionEndpoint;

  /** Get the device's audio/MIDI output endpoint. Override in subclasses. */
  abstract out(channel: number): ConnectionEndpoint;

  /** Set device description */
  description(desc: string): this {
    this._description = desc;
    this.patcher.setDescription(desc);
    return this;
  }

  /** Ensure live.thisdevice is present */
  ensureThisDevice(): Box {
    if (!this._hasThisDevice) {
      const box = this.add('live.thisdevice');
      this._hasThisDevice = true;
      return box;
    }
    // Return existing
    return this.boxes.find((b) => b.objectName === 'live.thisdevice')!;
  }

  /** Run auto-layout, then serialize and save to disk */
  save(options: SaveOptions = {}): string {
    // Auto-insert live.thisdevice if not present
    this.ensureThisDevice();

    // Run layout engines
    layoutPatching(this.patcher);
    layoutPresentation(this.patcher, this.params);

    // Enable presentation mode if we have params
    if (this.params.length > 0) {
      this.patcher.setOpenInPresentation(true);
    }

    // Determine output path
    const filename = options.filename ?? `${this._name}.maxpat`;
    const outputDir =
      options.outputDir ?? join(homedir(), ABLETON_PATHS[this.deviceType]);

    // Ensure directory exists
    mkdirSync(outputDir, { recursive: true });

    const outputPath = join(outputDir, filename);
    const json = this.patcher.toString();
    writeFileSync(outputPath, json, 'utf-8');

    // Run validation and print warnings
    const warnings = this.validate();
    for (const w of warnings) {
      console.warn(w);
    }

    console.log(`[mcp4max] Saved ${this.deviceType} "${this._name}" → ${outputPath}`);
    return outputPath;
  }

  /** Validate connections (signal vs message type mismatches) */
  validate(): string[] {
    const warnings: string[] = [];
    const lines = this.patcher.getLines();

    for (const line of lines) {
      const srcBox = this.patcher.getBox(line.source[0]);
      const dstBox = this.patcher.getBox(line.destination[0]);
      if (!srcBox || !dstBox) continue;

      const srcPort = line.source[1];
      const srcType = srcBox.outlettype[srcPort] ?? '';
      const isSignalOut = srcType === 'signal' || srcType === 'multichannelsignal';

      // Signal outlets should generally connect to signal inlets (objects ending in ~)
      // Message outlets should not connect to signal-only inlets
      const dstName = dstBox.objectName;
      const srcName = srcBox.objectName;
      const dstIsSignal = dstName.endsWith('~');
      const srcIsSignal = srcName.endsWith('~');

      // Warn if a non-signal outlet connects to a signal object's first inlet
      // (first inlet of ~ objects is typically signal)
      if (!isSignalOut && dstIsSignal && line.destination[1] === 0 && srcType !== 'bang') {
        // Many ~ objects accept messages on inlet 0 too, so this is just a warning
        // Skip well-known message→signal patterns
        const msgToSigOk = [
          'sig~', 'number~', 'line~', 'curve~', 'adsr~', 'snapshot~',
          'tapout~', 'tapin~', 'lores~', 'reson~', 'onepole~', 'allpass~', 'comb~',
          'delay~', 'mtof~', 'ftom~', 'atodb~', 'dbtoa~', 'cycle~', 'saw~',
          'rect~', 'tri~', 'phasor~', 'svf~', 'biquad~', 'groove~', 'play~',
          'buffer~', 'record~', 'filtercoeff~',
        ];
        if (!msgToSigOk.includes(dstName)) {
          warnings.push(
            `[warn] Message outlet ${srcName}:${srcPort} → signal inlet ${dstName}:0 (may need sig~ conversion)`,
          );
        }
      }
    }

    return warnings;
  }

  /** Serialize to JSON string without saving */
  toJSON(): string {
    this.ensureThisDevice();
    layoutPatching(this.patcher);
    layoutPresentation(this.patcher, this.params);
    if (this.params.length > 0) {
      this.patcher.setOpenInPresentation(true);
    }
    return this.patcher.toString();
  }

  private _resolveEndpoint(
    item: Box | Param | ConnectionEndpoint,
    direction: 'in' | 'out',
  ): ConnectionEndpoint {
    if ('boxId' in item && 'port' in item) {
      return item as ConnectionEndpoint;
    }
    if (item instanceof Param) {
      return direction === 'out' ? item.value : item.in(0);
    }
    if (item instanceof Box) {
      return direction === 'out' ? item.out(0) : item.in(0);
    }
    throw new Error('Invalid connection target');
  }
}
