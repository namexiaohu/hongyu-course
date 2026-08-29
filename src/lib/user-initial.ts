import { pinyin } from 'pinyin-pro';

function isCjkChar(char: string) {
  return /[\u3400-\u9fff]/.test(char);
}

/** Avatar letter: Latin first letter, or first pinyin initial for Chinese. */
export function getUserInitial(firstName: string, lastName?: string | null): string {
  const display = `${firstName ?? ''} ${lastName ?? ''}`.trim() || firstName?.trim() || '?';
  const firstChar = Array.from(display)[0] ?? '?';

  if (isCjkChar(firstChar)) {
    const py = pinyin(firstChar, { toneType: 'none', type: 'array' });
    const syllable = Array.isArray(py) ? py[0] : String(py);
    const initial = syllable?.trim()?.[0];
    return (initial || firstChar).toUpperCase();
  }

  return firstChar.toUpperCase();
}
