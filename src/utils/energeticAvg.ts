
export function energeticAvg(values: number[]): number {
  //Calculate the Number of average lenght
  const N_avg = values.length;

  // Calculate the sum of 10^(L_i/10) for each L_i
  const sum = values.reduce((acc, L_i) => acc + Math.pow(10, L_i / 10), 0);

  // Calculate the energetic average using the formula
  const energeticAvg = 10 * Math.log10(sum / N_avg);

  // Return the energetic average
  return energeticAvg;
}

export function energeticSum(values: number[]): number {
  // Calculate the sum of 10^(L_i/10) for each L_i
  const sum = values.reduce((acc, L_i) => acc + Math.pow(10, L_i / 10), 0);

  // Calculate the energetic sum using the formula
  const energeticSum = 10 * Math.log10(sum);

  // Return the energetic average
  return energeticSum;
}

export function testEnergeticSum() {
  const values = [
    [23, 40, 23],
    [20, 50, 20],
    [24, 63, 24],
    [28, 25, 28],
    [32, 24, 32],
    [37, 32, 37],
    [44, 36, 44],
    [46, 40, 46],
    [53, 44, 53],
    [27, 47, 27]
  ];
  const result : number[]= [];
  for (let i = 0; i < values.length; i++) {
    result.push(energeticSum(values[i]));
  }
  console.log(result);
  
}