// Types matching the real .maxpat JSON format

export interface MaxPatFile {
  patcher: PatcherData;
}

export interface PatcherData {
  fileversion: number;
  appversion: AppVersion;
  classnamespace: string;
  rect: [number, number, number, number];
  bglocked: number;
  openinpresentation: number;
  default_fontsize: number;
  default_fontface: number;
  default_fontname: string;
  gridonopen: number;
  gridsize: [number, number];
  gridsnaponopen: number;
  objectsnaponopen: number;
  statusbarvisible: number;
  toolbarvisible: number;
  lefttoolbarpinned: number;
  toptoolbarpinned: number;
  righttoolbarpinned: number;
  bottomtoolbarpinned: number;
  toolbars_unpinned_last_save: number;
  tallnewobj: number;
  boxanimatetime: number;
  enablehscroll: number;
  enablevscroll: number;
  devicewidth: number;
  description: string;
  digest: string;
  tags: string;
  style: string;
  subpatcher_template: string;
  assistshowspatchername: number;
  boxes: { box: BoxData }[];
  lines: { patchline: PatchlineData }[];
  parameters: Record<string, unknown>;
  dependency_cache: unknown[];
  autosave: number;
}

export interface AppVersion {
  major: number;
  minor: number;
  revision: number;
  architecture: string;
  modernui: number;
}

export interface BoxData {
  id: string;
  maxclass: string;
  numinlets: number;
  numoutlets: number;
  outlettype: string[];
  patching_rect: [number, number, number, number];
  text?: string;
  comment?: string;
  // Presentation mode
  presentation?: number;
  presentation_rect?: [number, number, number, number];
  // Parameter attributes
  parameter_enable?: number;
  saved_attribute_attributes?: Record<string, unknown>;
  varname?: string;
  // Live parameter info
  saved_object_attributes?: Record<string, unknown>;
  // Style
  style?: string;
  fontname?: string;
  fontsize?: number;
  // Additional properties for specific object types
  [key: string]: unknown;
}

export interface PatchlineData {
  source: [string, number];
  destination: [string, number];
  order: number;
}

export interface ConnectionEndpoint {
  boxId: string;
  port: number;
}

export interface ObjectSpec {
  numinlets: number;
  numoutlets: number;
  outlettype: string[];
  maxclass?: string; // override maxclass (e.g. "newobj" vs "comment")
  defaultWidth?: number;
}

export type DeviceType = 'audio_effect' | 'midi_effect' | 'instrument';

export interface ParamOptions {
  type: 'dial' | 'slider' | 'menu' | 'toggle' | 'button' | 'tab' | 'numbox';
  shortname?: string;
  longname?: string;
  min?: number;
  max?: number;
  initial?: number;
  unitstyle?: string;
  exponent?: number;
  steps?: number;
  enum?: string[];
  // Layout
  width?: number;
  height?: number;
}

export interface SaveOptions {
  filename?: string;
  outputDir?: string;
}

export const DEFAULT_APP_VERSION: AppVersion = {
  major: 8,
  minor: 6,
  revision: 5,
  architecture: 'x64',
  modernui: 1,
};
