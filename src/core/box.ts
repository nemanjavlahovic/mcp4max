import type { BoxData, ConnectionEndpoint, ObjectSpec } from './types.js';

const CHAR_WIDTH = 7; // approximate char width at 12pt font
const MIN_BOX_WIDTH = 40;
const BOX_PADDING = 16;

function calculateBoxWidth(text: string): number {
  return Math.max(MIN_BOX_WIDTH, text.length * CHAR_WIDTH + BOX_PADDING);
}

let boxCounter = 0;

export function resetBoxCounter(): void {
  boxCounter = 0;
}

export class Box {
  readonly id: string;
  readonly maxclass: string;
  readonly objectName: string;
  readonly numinlets: number;
  readonly numoutlets: number;
  readonly outlettype: string[];
  readonly args: string;

  private _patchingRect: [number, number, number, number] = [0, 0, 120, 22];
  private _presentation = false;
  private _presentationRect: [number, number, number, number] = [0, 0, 120, 22];
  private _extraProps: Record<string, unknown> = {};

  constructor(
    objectName: string,
    spec: ObjectSpec,
    args: string = '',
    extraProps: Record<string, unknown> = {},
  ) {
    this.id = `obj-${++boxCounter}`;
    this.objectName = objectName;
    this.maxclass = spec.maxclass ?? 'newobj';
    this.numinlets = spec.numinlets;
    this.numoutlets = spec.numoutlets;
    this.outlettype = spec.outlettype;
    this.args = args;
    this._extraProps = { ...extraProps };

    if (spec.defaultWidth) {
      this._patchingRect[2] = spec.defaultWidth;
    } else if (this.maxclass === 'newobj') {
      // Auto-calculate width from text content
      const fullText = args ? `${objectName} ${args}` : objectName;
      this._patchingRect[2] = calculateBoxWidth(fullText);
    }
  }

  in(port: number = 0): ConnectionEndpoint {
    if (port < 0 || port >= this.numinlets) {
      throw new Error(
        `Box "${this.objectName}" has ${this.numinlets} inlets, port ${port} out of range`,
      );
    }
    return { boxId: this.id, port };
  }

  out(port: number = 0): ConnectionEndpoint {
    if (port < 0 || port >= this.numoutlets) {
      throw new Error(
        `Box "${this.objectName}" has ${this.numoutlets} outlets, port ${port} out of range`,
      );
    }
    return { boxId: this.id, port };
  }

  setPatchingRect(rect: [number, number, number, number]): void {
    this._patchingRect = rect;
  }

  getPatchingRect(): [number, number, number, number] {
    return [...this._patchingRect];
  }

  setPresentation(enabled: boolean, rect?: [number, number, number, number]): void {
    this._presentation = enabled;
    if (rect) {
      this._presentationRect = rect;
    }
  }

  setExtraProp(key: string, value: unknown): void {
    this._extraProps[key] = value;
  }

  toJSON(): BoxData {
    const text =
      this.maxclass === 'newobj'
        ? this.args
          ? `${this.objectName} ${this.args}`
          : this.objectName
        : this.maxclass === 'comment'
          ? undefined
          : undefined;

    const data: BoxData = {
      id: this.id,
      maxclass: this.maxclass,
      numinlets: this.numinlets,
      numoutlets: this.numoutlets,
      outlettype: this.outlettype,
      patching_rect: [...this._patchingRect],
      ...this._extraProps,
    };

    if (text !== undefined) {
      data.text = text;
    }

    if (this._presentation) {
      data.presentation = 1;
      data.presentation_rect = [...this._presentationRect];
    }

    return data;
  }
}
