export default function energeticAvg(values: number[]): number {
  //Calculate the Number of average lenght
  const N_avg = values.length;

  // Calculate the sum of 10^(L_i/10) for each L_i
  const sum = values.reduce((acc, L_i) => acc + Math.pow(10, L_i / 10), 0);

  // Calculate the energetic average using the formula
  const energeticAvg = 10 * Math.log10(sum / N_avg);

  // Return the energetic average rounded to two decimal places
  return Math.round(energeticAvg * 100) / 100;
}
