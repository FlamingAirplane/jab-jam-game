// matchups.js — elemental damage multipliers from the game design doc.
import {
  elementBeats, elementAdvantageMul,
  lightBaseMul, lightVsDarknessMul, darknessBaseMul, darknessVsLightMul,
} from './tuning.js?v=2';

// Multiplier for damage dealt by an attacker of one element to a defender of another.
export function elementMultiplier(attacker, defender) {
  if (!attacker || !defender) return 1;
  if (attacker === 'light') return defender === 'darkness' ? lightVsDarknessMul : lightBaseMul;
  if (attacker === 'darkness') return defender === 'light' ? darknessVsLightMul : darknessBaseMul;
  if ((elementBeats[attacker] ?? []).includes(defender)) return elementAdvantageMul;
  return 1;
}
