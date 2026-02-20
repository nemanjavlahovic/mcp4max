import { Box } from '../core/box.js';
import type { ConnectionEndpoint, ObjectSpec, ParamOptions } from '../core/types.js';

// Map param type → maxclass + default dimensions
const PARAM_SPECS: Record<string, { maxclass: string; width: number; height: number; numinlets: number; numoutlets: number; outlettype: string[] }> = {
  dial:    { maxclass: 'live.dial',    width: 44,  height: 48,  numinlets: 1, numoutlets: 2, outlettype: ['', ''] },
  slider:  { maxclass: 'live.slider',  width: 40,  height: 80,  numinlets: 1, numoutlets: 2, outlettype: ['', ''] },
  menu:    { maxclass: 'live.menu',    width: 100, height: 15,  numinlets: 1, numoutlets: 3, outlettype: ['', '', ''] },
  toggle:  { maxclass: 'live.toggle',  width: 15,  height: 15,  numinlets: 1, numoutlets: 1, outlettype: [''] },
  button:  { maxclass: 'live.button',  width: 15,  height: 15,  numinlets: 1, numoutlets: 1, outlettype: ['bang'] },
  tab:     { maxclass: 'live.tab',     width: 100, height: 20,  numinlets: 1, numoutlets: 3, outlettype: ['', '', ''] },
  numbox:  { maxclass: 'live.numbox',  width: 44,  height: 15,  numinlets: 1, numoutlets: 2, outlettype: ['', ''] },
};

const UNITSTYLES: Record<string, number> = {
  int: 0,
  float: 1,
  time: 2,
  hertz: 3,
  decibel: 4,
  '%': 5,
  pan: 6,
  semitone: 7,
  midi: 8,
  custom: 9,
  native: 10,
};

export class Param {
  readonly box: Box;
  readonly options: ParamOptions;

  constructor(name: string, options: ParamOptions) {
    this.options = options;

    const specInfo = PARAM_SPECS[options.type];
    if (!specInfo) {
      throw new Error(`Unknown param type: ${options.type}`);
    }

    const spec: ObjectSpec = {
      numinlets: specInfo.numinlets,
      numoutlets: specInfo.numoutlets,
      outlettype: specInfo.outlettype,
      maxclass: specInfo.maxclass,
      defaultWidth: options.width ?? specInfo.width,
    };

    const longname = options.longname ?? name;
    const shortname = options.shortname ?? name;

    // All parameter metadata goes in saved_attribute_attributes.valueof
    const valueof: Record<string, unknown> = {
      parameter_longname: longname,
      parameter_shortname: shortname,
      parameter_type: options.type === 'menu' || options.type === 'tab' ? 2 : 0, // 0=float, 2=enum
      parameter_unitstyle: UNITSTYLES[options.unitstyle ?? 'int'] ?? 0,
      parameter_modmode: 0,
    };

    if (options.min !== undefined) valueof.parameter_mmin = options.min;
    if (options.max !== undefined) valueof.parameter_mmax = options.max;
    if (options.initial !== undefined) {
      valueof.parameter_initial = [options.initial];
      valueof.parameter_initial_enable = 1;
    }
    if (options.exponent !== undefined) valueof.parameter_exponent = options.exponent;
    if (options.steps !== undefined) valueof.parameter_steps = options.steps;
    if (options.enum) valueof.parameter_enum = options.enum;

    const extraProps: Record<string, unknown> = {
      parameter_enable: 1,
      saved_attribute_attributes: { valueof },
      varname: longname,
    };

    // Set presentation height
    const height = options.height ?? specInfo.height;
    this.box = new Box(specInfo.maxclass, spec, '', extraProps);
    this.box.setPatchingRect([0, 0, options.width ?? specInfo.width, height]);
  }

  /** Outlet 0: formatted value */
  get value(): ConnectionEndpoint {
    return this.box.out(0);
  }

  /** Outlet 1: raw 0-1 float (for dial/slider/numbox) */
  get raw(): ConnectionEndpoint {
    if (this.box.numoutlets < 2) {
      throw new Error(`Param type "${this.options.type}" has no raw outlet`);
    }
    return this.box.out(1);
  }

  in(port: number = 0): ConnectionEndpoint {
    return this.box.in(port);
  }

  out(port: number = 0): ConnectionEndpoint {
    return this.box.out(port);
  }
}
