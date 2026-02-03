import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'decimalToTime'
})
export class DecimalToTimePipe implements PipeTransform {

  transform(value: number | null): string {
    if (value == null || isNaN(value)) return '-';

    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);

    return `${hours}h ${minutes}m`;
  }
}
