export function format(num: number, locale: string = "en") {
  if (typeof num !== 'number') return num;

  if (locale === "ja") {
    if (Math.abs(num) >= 100_000_000) {
      return (num / 100_000_000).toFixed(2).replace(/\.?0+$/, '') + '億';
    }
    if (Math.abs(num) >= 10_000) {
      return (num / 10_000).toFixed(2).replace(/\.?0+$/, '') + '万';
    }
    return num.toFixed(2);
  }

  if (Math.abs(num) >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.?0+$/, '') + 'b';
  }
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(2).replace(/\.?0+$/, '') + 'm';
  }
  if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(2).replace(/\.?0+$/, '') + 'k';
  }
  return num.toFixed(2);
}