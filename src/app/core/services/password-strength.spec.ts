import { computePasswordStrength } from './password-strength';

describe('computePasswordStrength', () => {
  it('returns a faible score for an empty password', () => {
    expect(computePasswordStrength('')).toEqual({ score: 0, level: 'faible', label: 'Faible' });
  });

  it('does not credit the length criterion at 7 characters', () => {
    expect(computePasswordStrength('Aa1!aaB').score).toBe(3);
  });

  it('credits the length criterion at 8 characters', () => {
    expect(computePasswordStrength('Aa1!aaBc').score).toBe(4);
  });

  it('does not credit the digit criterion when no digit is present', () => {
    const result = computePasswordStrength('Aabcdefg!');
    expect(result.score).toBe(3);
    expect(result.level).toBe('fort');
  });

  it('does not credit the special char criterion when none is present', () => {
    const result = computePasswordStrength('Aabcdefg1');
    expect(result.score).toBe(3);
    expect(result.level).toBe('fort');
  });

  it('reaches fort when all criteria are met', () => {
    expect(computePasswordStrength('Aa1!aaaa')).toEqual({ score: 4, level: 'fort', label: 'Fort' });
  });

  it('is moyen when exactly two criteria are met', () => {
    expect(computePasswordStrength('aaaaaaa1').score).toBe(2);
    expect(computePasswordStrength('aaaaaaa1').level).toBe('moyen');
  });

  it('is faible when only one criterion is met', () => {
    expect(computePasswordStrength('aaaaaaaa').score).toBe(1);
    expect(computePasswordStrength('aaaaaaaa').level).toBe('faible');
  });
});
