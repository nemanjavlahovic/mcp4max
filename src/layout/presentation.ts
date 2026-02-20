import { Patcher } from '../core/patcher.js';
import { Param } from '../params/live-params.js';

const PRES_X_START = 4;
const PRES_Y_START = 4;
const PRES_X_GAP = 8;

/**
 * Horizontal layout for the device presentation (UI face).
 * Places all params left-to-right and sets devicewidth.
 */
export function layoutPresentation(patcher: Patcher, params: Param[]): void {
  if (params.length === 0) return;

  let x = PRES_X_START;
  let maxHeight = 0;

  for (const param of params) {
    const rect = param.box.getPatchingRect();
    const width = rect[2];
    const height = rect[3];

    param.box.setPresentation(true, [x, PRES_Y_START, width, height]);
    x += width + PRES_X_GAP;
    maxHeight = Math.max(maxHeight, height);
  }

  // Set device width to accommodate all params
  const deviceWidth = x + PRES_X_START;
  patcher.setDeviceWidth(deviceWidth);
}
