function twoDecimalsRounded(number: number): number {
  const stdDevStr = number.toString();

  const valueTillDot = stdDevStr.split('').findIndex((char) => char === '.');

  const lastNonZeroIndex = stdDevStr
    .split('')
    .findIndex((char) => char !== '0' && char !== '.');

  const significantDigitsIndex =
    stdDevStr.length - lastNonZeroIndex -1 ;

  const formattedStdDevStr = stdDevStr.slice(0, significantDigitsIndex + 2);

  return parseFloat(formattedStdDevStr);
}
