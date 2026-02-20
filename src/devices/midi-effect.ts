import { BaseDevice } from './base-device.js';
import type { ConnectionEndpoint, DeviceType } from '../core/types.js';
import type { Box } from '../core/box.js';

export class MIDIEffect extends BaseDevice {
  readonly deviceType: DeviceType = 'midi_effect';
  readonly midiinBox: Box;
  readonly midioutBox: Box;

  constructor(name: string) {
    super(name);
    this.midiinBox = this.add('midiin');
    this.midioutBox = this.add('midiout');
  }

  /** MIDI input (outlet of midiin). port is ignored — midiin has 1 outlet. */
  in(port: number = 0): ConnectionEndpoint {
    return this.midiinBox.out(0);
  }

  /** MIDI output (inlet of midiout). port is ignored — midiout has 1 inlet. */
  out(port: number = 0): ConnectionEndpoint {
    return this.midioutBox.in(0);
  }
}
