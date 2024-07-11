import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'soundPressureDisplay',
})
export class SoundPressureDisplayPipe implements PipeTransform {

  transform(value: number[]): string {
    if (!value || value.length !== 2) {
      return '';
    }

    const [low, high] = value;

    if (low === 80 && high === 80) {
      return '>80 dBA';
    } else if (low === 35 && high === 35) {
      return '≤35 dBA';
    } else if (low === 35 && high === 80) {
      return '≤35 - >80 dBA';
    } else if (high === 80) {
      return `${low} - >80 dBA`;
    } else if (low === 35) {
      return `≤35 - ${high} dBA`;
    } else {
      return `${low} - ${high} dBA`;
    }  }

}
