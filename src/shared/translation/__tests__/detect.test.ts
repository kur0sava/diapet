import { detectLang, hashText } from '../detect';

describe('detectLang', () => {
  it('detects Russian', () => {
    expect(detectLang('Привет, как дела у кота?')).toBe('ru');
  });
  it('detects English', () => {
    expect(detectLang('Hi, how is your cat doing?')).toBe('en');
  });
  it('goes by dominant alphabet in mixed text', () => {
    expect(detectLang('Мой кот на Lantus уже месяц')).toBe('ru');
    expect(detectLang('My cat is on Лантус now')).toBe('en');
  });
  it('defaults to en for empty/neutral', () => {
    expect(detectLang('123 :)')).toBe('en');
  });
});

describe('hashText', () => {
  it('is stable and differs by content', () => {
    expect(hashText('hello')).toBe(hashText('hello'));
    expect(hashText('hello')).not.toBe(hashText('world'));
  });
});
