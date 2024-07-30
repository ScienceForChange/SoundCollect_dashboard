export default function calculateStandardDeviation(numbers: number[]): number {
  // Step 1: Calculate the mean
  const mean = numbers.reduce((acc, val) => acc + val, 0) / numbers.length;

  // Step 2: Calculate the squared deviations from the mean
  const squaredDeviations = numbers.map((val) => (val - mean) ** 2);

  // Step 3: Calculate the mean of the squared deviations
  const meanOfSquaredDeviations =
    squaredDeviations.reduce((acc, val) => acc + val, 0) /
    squaredDeviations.length;

  // Step 4: Take the square root of the mean of the squared deviations
  const standardDeviation = Math.sqrt(meanOfSquaredDeviations);

  return parseFloat(standardDeviation.toFixed(2));
}
