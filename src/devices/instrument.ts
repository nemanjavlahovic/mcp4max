import { BaseDevice } from './base-device.js';
import type { ConnectionEndpoint, DeviceType } from '../core/types.js';
import type { Box } from '../core/box.js';

export class Instrument extends BaseDevice {
  readonly deviceType: DeviceType = 'instrument';
  readonly midiinBox: Box;
  readonly plugoutBox: Box;

  constructor(name: string) {
    super(name);
    this.midiinBox = this.add('midiin');
    this.plugoutBox = this.add('plugout~');
  }

  /** MIDI input (outlet of midiin). */
  in(port: number = 0): ConnectionEndpoint {
    return this.midiinBox.out(0);
  }

  /** Audio output inlet. channel 0 = left, 1 = right */
  out(channel: number = 0): ConnectionEndpoint {
    if (channel < 0 || channel > 1) {
      throw new Error(`Instrument has 2 output channels (0=L, 1=R), got ${channel}`);
    }
    return this.plugoutBox.in(channel);
  }
}
