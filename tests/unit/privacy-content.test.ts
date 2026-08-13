import { describe, expect, it } from 'vitest';
import { PRIVACY_SECTIONS } from '../../src/privacy/content';

/**
 * Regression guard untuk FR-006 (specs/003-drop-utbk-snbt): teks kebijakan
 * privasi MUST NOT lagi menjanjikan jenjang "UTBK/SNBT" yang di luar cakupan
 * Lumera Constitution v2.0.0.
 */

describe('PRIVACY_SECTIONS', () => {
  it('tidak menyebut UTBK atau SNBT di paragraf manapun', () => {
    for (const section of PRIVACY_SECTIONS) {
      for (const paragraf of section.paragraf) {
        expect(paragraf.toLowerCase()).not.toMatch(/utbk|snbt/);
      }
    }
  });
});
