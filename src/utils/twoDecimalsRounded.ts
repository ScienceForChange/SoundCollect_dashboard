function round(value: number) {
  const stdDevStr = value.toString();
  const valueTillDot = stdDevStr.split('').findIndex((char) => char === '.');
  const lastNonZeroIndex = stdDevStr
    .slice(valueTillDot + 1)
    .split('')
    .findIndex((char) => char !== '0');
  const minimumFractionDigits = 0;
  const maximumFractionDigits = lastNonZeroIndex + 2;
  const formattedValue = value.toLocaleString('en', {
    useGrouping: false,
    minimumFractionDigits,
    maximumFractionDigits,
  });
  return Number(formattedValue);
}
