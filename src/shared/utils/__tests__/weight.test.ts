import { kgToLb, lbToKg, kgToInput, inputToKg, convertInput } from '../weight';

describe('weight conversion', () => {
  it('kg ↔ lb round-trips', () => {
    expect(kgToLb(10)).toBeCloseTo(22.0462, 3);
    expect(lbToKg(22.0462)).toBeCloseTo(10, 5);
  });

  it('inputToKg converts pounds to canonical kg', () => {
    // 66 lb ≈ 29.9 kg — the audit A3 scenario (US owner types "66").
    expect(inputToKg('66', 'lb')!).toBeCloseTo(29.937, 2);
    expect(inputToKg('4.5', 'kg')).toBe(4.5);
  });

  it('inputToKg rejects empty / non-positive / invalid', () => {
    expect(inputToKg('', 'kg')).toBeUndefined();
    expect(inputToKg('0', 'kg')).toBeUndefined();
    expect(inputToKg('-3', 'lb')).toBeUndefined();
    expect(inputToKg('abc', 'kg')).toBeUndefined();
  });

  it('kgToInput renders 1 decimal in the target unit, empty for no weight', () => {
    expect(kgToInput(29.937, 'lb')).toBe('66');
    expect(kgToInput(4.5, 'kg')).toBe('4.5');
    expect(kgToInput(undefined, 'kg')).toBe('');
    expect(kgToInput(0, 'lb')).toBe('');
  });

  it('convertInput is stable through a kg→lb→kg toggle', () => {
    const asLb = convertInput('10', 'kg', 'lb'); // "22"
    expect(asLb).toBe('22');
    expect(convertInput(asLb, 'lb', 'kg')).toBe('10'); // 22 lb → 9.97... → "10"
    expect(convertInput('', 'kg', 'lb')).toBe('');
    expect(convertInput('7', 'kg', 'kg')).toBe('7');
  });
});
