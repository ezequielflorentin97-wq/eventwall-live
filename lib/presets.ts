import type { Preset } from './config'
import xv from '../presets/xv.json'
import boda from '../presets/boda.json'
import corporativo from '../presets/corporativo.json'
import cumpleanos from '../presets/cumpleanos.json'

export const PRESETS: Record<string, Preset> = { xv, boda, corporativo, cumpleanos }
export const PRESET_NAMES = Object.keys(PRESETS)
