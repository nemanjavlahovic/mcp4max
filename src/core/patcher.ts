import type { BoxData, MaxPatFile, PatcherData, PatchlineData } from './types.js';
import { DEFAULT_APP_VERSION } from './types.js';
import { Box } from './box.js';

export class Patcher {
  private boxes: Map<string, Box> = new Map();
  private lines: PatchlineData[] = [];
  private _deviceWidth = 0;
  private _openInPresentation = 0;
  private _description = '';
  private _tags = '';

  addBox(box: Box): void {
    this.boxes.set(box.id, box);
  }

  addLine(source: [string, number], destination: [string, number]): void {
    this.lines.push({
      source,
      destination,
      order: 0,
    });
  }

  getBox(id: string): Box | undefined {
    return this.boxes.get(id);
  }

  getAllBoxes(): Box[] {
    return Array.from(this.boxes.values());
  }

  getLines(): PatchlineData[] {
    return [...this.lines];
  }

  setDeviceWidth(width: number): void {
    this._deviceWidth = width;
  }

  setOpenInPresentation(open: boolean): void {
    this._openInPresentation = open ? 1 : 0;
  }

  setDescription(desc: string): void {
    this._description = desc;
  }

  setTags(tags: string): void {
    this._tags = tags;
  }

  // Build adjacency from lines for layout
  getAdjacency(): Map<string, Set<string>> {
    const adj = new Map<string, Set<string>>();
    for (const box of this.boxes.values()) {
      adj.set(box.id, new Set());
    }
    for (const line of this.lines) {
      const srcId = line.source[0];
      adj.get(srcId)?.add(line.destination[0]);
    }
    return adj;
  }

  // Reverse adjacency for in-degree calculation
  getInDegree(): Map<string, number> {
    const inDeg = new Map<string, number>();
    for (const box of this.boxes.values()) {
      inDeg.set(box.id, 0);
    }
    for (const line of this.lines) {
      const destId = line.destination[0];
      inDeg.set(destId, (inDeg.get(destId) ?? 0) + 1);
    }
    return inDeg;
  }

  toJSON(): MaxPatFile {
    const boxesArray: { box: BoxData }[] = [];
    for (const box of this.boxes.values()) {
      boxesArray.push({ box: box.toJSON() });
    }

    const linesArray: { patchline: PatchlineData }[] = this.lines.map((line) => ({
      patchline: line,
    }));

    const patcher: PatcherData = {
      fileversion: 1,
      appversion: { ...DEFAULT_APP_VERSION },
      classnamespace: 'box',
      rect: [0, 0, 900, 700],
      bglocked: 0,
      openinpresentation: this._openInPresentation,
      default_fontsize: 12,
      default_fontface: 0,
      default_fontname: 'Arial',
      gridonopen: 1,
      gridsize: [15, 15],
      gridsnaponopen: 1,
      objectsnaponopen: 1,
      statusbarvisible: 2,
      toolbarvisible: 1,
      lefttoolbarpinned: 0,
      toptoolbarpinned: 0,
      righttoolbarpinned: 0,
      bottomtoolbarpinned: 0,
      toolbars_unpinned_last_save: 0,
      tallnewobj: 0,
      boxanimatetime: 200,
      enablehscroll: 1,
      enablevscroll: 1,
      devicewidth: this._deviceWidth,
      description: this._description,
      digest: '',
      tags: this._tags,
      style: '',
      subpatcher_template: '',
      assistshowspatchername: 0,
      boxes: boxesArray,
      lines: linesArray,
      parameters: {},
      dependency_cache: [],
      autosave: 0,
    };

    return { patcher };
  }

  toString(): string {
    return JSON.stringify(this.toJSON(), null, 2);
  }
}
