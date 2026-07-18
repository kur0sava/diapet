import { moderateText, validateMessageText } from '../moderation';
import { getRoomById } from '../../data/rooms';

const insulinRoom = getRoomById('insulin'); // moderation: 'max'
const loungeRoom = getRoomById('lounge'); // moderation: 'low'

describe('moderateText', () => {
  it('passes clean text', () => {
    const r = moderateText('Как дела у Барсика сегодня? Хорошо поел.', loungeRoom);
    expect(r.level).toBe('ok');
    expect(r.reasons).toEqual([]);
  });

  it('blocks abuse', () => {
    const r = moderateText('ты идиот и ничего не понимаешь', loungeRoom);
    expect(r.level).toBe('block');
    expect(r.reasons).toContain('abuse');
  });

  it('warns on external links', () => {
    const r = moderateText('смотри тут www.example.com много инфы', loungeRoom);
    expect(r.level).toBe('warn');
    expect(r.reasons).toContain('link');
  });

  it('warns on phone numbers', () => {
    const r = moderateText('пиши мне +7 999 123 45 67', loungeRoom);
    expect(r.level).toBe('warn');
    expect(r.reasons).toContain('contact');
  });

  it('flags dose advice (RU) in any room', () => {
    const r = moderateText('коли 5 единиц утром и всё будет ок', insulinRoom);
    expect(r.level).toBe('warn');
    expect(r.reasons).toContain('dose_advice');
  });

  it('flags dose advice (EN)', () => {
    const r = moderateText('just give 3 units twice a day', insulinRoom);
    expect(r.level).toBe('warn');
    expect(r.reasons).toContain('dose_advice');
  });

  it('warns on flood / shouting', () => {
    expect(moderateText('ааааааааа помогите', loungeRoom).reasons).toContain('flood');
    expect(moderateText('ПОЧЕМУ НИКТО НЕ ОТВЕЧАЕТ МНЕ СРОЧНО', loungeRoom).reasons).toContain(
      'flood'
    );
  });

  it('escalates to the most severe level', () => {
    // abuse (block) + link (warn) → block
    const r = moderateText('ты идиот, вот пруф www.foo.ru', loungeRoom);
    expect(r.level).toBe('block');
  });

  it('does not false-positive on normal glucose talk', () => {
    const r = moderateText('сегодня глюкоза 8.5, вчера была 12', insulinRoom);
    expect(r.level).toBe('ok');
  });
});

describe('validateMessageText', () => {
  it('rejects empty', () => {
    expect(validateMessageText('   ')).toBe('empty');
  });
  it('rejects too long', () => {
    expect(validateMessageText('a'.repeat(4001))).toBe('too_long');
  });
  it('accepts normal', () => {
    expect(validateMessageText('привет всем')).toBe('ok');
  });
});
