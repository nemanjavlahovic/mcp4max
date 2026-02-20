import { BaseDevice } from './base-device.js';
import type { ConnectionEndpoint, DeviceType } from '../core/types.js';
import type { Box } from '../core/box.js';

export class AudioEffect extends BaseDevice {
  readonly deviceType: DeviceType = 'audio_effect';
  readonly pluginL: Box;
  readonly pluginR: Box; // Same box, different outlet
  readonly plugoutBox: Box;

  constructor(name: string) {
    super(name);

    // plugin~ provides stereo input (2 outlets)
    this.pluginL = this.add('plugin~');
    // plugout~ accepts stereo output (2 inlets)
    this.plugoutBox = this.add('plugout~');

    // Alias for clearer naming
    this.pluginR = this.pluginL;
  }

  /** Get device audio input. channel 0 = left, 1 = right */
  in(channel: number = 0): ConnectionEndpoint {
    if (channel < 0 || channel > 1) {
      throw new Error(`AudioEffect has 2 input channels (0=L, 1=R), got ${channel}`);
    }
    return this.pluginL.out(channel);
  }

  /** Get device audio output inlet. channel 0 = left, 1 = right */
  out(channel: number = 0): ConnectionEndpoint {
    if (channel < 0 || channel > 1) {
      throw new Error(`AudioEffect has 2 output channels (0=L, 1=R), got ${channel}`);
    }
    return this.plugoutBox.in(channel);
  }
}
