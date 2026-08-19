import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    pipe = new TimeAgoPipe();
  });

  const isoAgo = (ms: number): string => new Date(Date.now() - ms).toISOString();

  it('returns empty string for null or invalid input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('not-a-date')).toBe('');
  });

  it('returns "à l\'instant" under one minute', () => {
    expect(pipe.transform(isoAgo(30_000))).toBe("à l'instant");
  });

  it('returns minutes under one hour', () => {
    expect(pipe.transform(isoAgo(45 * 60_000))).toBe('il y a 45 min');
  });

  it('returns hours under one day', () => {
    expect(pipe.transform(isoAgo(2 * 3_600_000))).toBe('il y a 2 h');
  });

  it('returns days under one week', () => {
    expect(pipe.transform(isoAgo(3 * 86_400_000))).toBe('il y a 3 j');
  });

  it('returns a short date beyond one week', () => {
    const result = pipe.transform('2026-02-14T10:00:00Z');
    expect(result).toContain('14');
    expect(result.toLowerCase()).toContain('fév');
  });
});
