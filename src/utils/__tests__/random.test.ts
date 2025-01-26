import randomStr, { randomId } from '../random';

describe('randomStr', () => {
  it('should return string', () => {
    const str = randomStr();

    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThan(0);
  });

  it('should return string with prefix', () => {
    const str = randomStr({ prefix: 'abc-' });

    expect(str.split('-')).toEqual(['abc', expect.any(String)]);
  });

  it.each([1, 10, 100])('should return string with length %s', length => {
    expect(randomStr({ length })).toHaveLength(length);
  });

  it.each(['x', '8'])('should return string only with candidates %s', char => {
    const length = 10;
    const candidates = [char];
    const prev = randomStr({
      length,
      candidates,
    });

    expect(() => {
      for (let i = 0; i < 5; i += 1) {
        const next = randomStr({
          length,
          candidates,
        });

        if (prev !== next) {
          throw Error();
        }
      }
    }).not.toThrow();
  });

  it('should return different result at least in 5 times', () => {
    const candidates = ['a', 'b'];
    const length = 1;
    const prev = randomStr({
      length,
      candidates,
    });

    expect(() => {
      for (let i = 0; i < 5; i += 1) {
        const next = randomStr({
          length,
          candidates,
        });

        if (prev !== next) {
          return;
        }
      }

      throw Error();
    }).not.toThrow();
  });
});

describe('randomId', () => {
  it('should return string with prefix', () => {
    const str = randomId();
    const [prefix, id] = str.split('-');

    expect(typeof str).toBe('string');
    expect(str.length).toBeGreaterThan(0);
    expect(prefix.length).toBeGreaterThan(0);
    expect(id.length).toBeGreaterThan(0);
  });
});
