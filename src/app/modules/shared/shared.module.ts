import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbsPipe } from 'src/app/pipes/abs.pipe';
import { FilterTablePipe } from 'src/app/pipes/filterTable.pipe';
import { DecimalToTimePipe } from 'src/app/pipes/decimal-to-time.pipe';

@NgModule({
  declarations: [AbsPipe, FilterTablePipe, DecimalToTimePipe],
  imports: [CommonModule],
  exports: [AbsPipe, FilterTablePipe, DecimalToTimePipe] // Export so others can use
})
export class SharedModule { }
