import { Patcher } from '../core/patcher.js';

const X_START = 30;
const Y_START = 30;
const X_GAP = 180;
const Y_GAP = 50;

/**
 * Topological sort layout for the patching (editor) view.
 * Params are placed on the left column, DSP/logic objects in subsequent columns.
 */
export function layoutPatching(patcher: Patcher): void {
  const boxes = patcher.getAllBoxes();
  if (boxes.length === 0) return;

  const adj = patcher.getAdjacency();
  const inDeg = patcher.getInDegree();

  // Separate UI params (live.*) from logic objects
  const paramBoxIds = new Set<string>();
  const logicBoxIds = new Set<string>();

  for (const box of boxes) {
    if (
      box.maxclass.startsWith('live.') &&
      box.maxclass !== 'live.thisdevice' &&
      box.maxclass !== 'live.object' &&
      box.maxclass !== 'live.path' &&
      box.maxclass !== 'live.observer' &&
      box.maxclass !== 'live.remote~'
    ) {
      paramBoxIds.add(box.id);
    } else {
      logicBoxIds.add(box.id);
    }
  }

  // Topological sort of logic objects into layers
  const layers: string[][] = [];
  const visited = new Set<string>();

  // Clone in-degree for logic nodes only
  const logicInDeg = new Map<string, number>();
  for (const id of logicBoxIds) {
    logicInDeg.set(id, inDeg.get(id) ?? 0);
  }

  // BFS layers
  let queue: string[] = [];
  for (const [id, deg] of logicInDeg) {
    if (deg === 0) {
      queue.push(id);
      visited.add(id);
    }
  }

  while (queue.length > 0) {
    layers.push([...queue]);
    const nextQueue: string[] = [];

    for (const id of queue) {
      const neighbors = adj.get(id);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!logicBoxIds.has(neighbor) || visited.has(neighbor)) continue;
          const newDeg = (logicInDeg.get(neighbor) ?? 1) - 1;
          logicInDeg.set(neighbor, newDeg);
          if (newDeg === 0) {
            nextQueue.push(neighbor);
            visited.add(neighbor);
          }
        }
      }
    }

    queue = nextQueue;
  }

  // Any unvisited logic nodes (cycles) go in a final layer
  for (const id of logicBoxIds) {
    if (!visited.has(id)) {
      if (layers.length === 0) layers.push([]);
      layers[layers.length - 1].push(id);
    }
  }

  // Layout params in leftmost column
  let paramY = Y_START;
  for (const box of boxes) {
    if (paramBoxIds.has(box.id)) {
      const rect = box.getPatchingRect();
      box.setPatchingRect([X_START, paramY, rect[2], rect[3]]);
      paramY += rect[3] + Y_GAP;
    }
  }

  // Layout logic layers, offset to the right of params
  const logicXStart = paramBoxIds.size > 0 ? X_START + X_GAP : X_START;

  for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
    const layer = layers[layerIdx];
    let y = Y_START;

    for (const id of layer) {
      const box = patcher.getBox(id);
      if (!box) continue;
      const rect = box.getPatchingRect();
      const x = logicXStart + layerIdx * X_GAP;
      box.setPatchingRect([x, y, rect[2], rect[3]]);
      y += rect[3] + Y_GAP;
    }
  }
}
