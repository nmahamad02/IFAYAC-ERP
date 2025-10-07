import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomerDetailComponent } from './customer-component/customer-detail/customer-detail.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTreeModule } from '@angular/material/tree';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { SharedModule } from '../shared/shared.module';
import { ReportsComponent } from './reports-component/reports/reports.component';

export const receivablesRoutes = [
  {
    path: 'customer/detail/:pcode',
    component: CustomerDetailComponent
  },
  {
    path: 'Financial-Reports',
    component: ReportsComponent
  }
];

@NgModule({
  declarations: [
    CustomerDetailComponent,
    ReportsComponent
  ],
  imports: [
    MatIconModule,
    CommonModule,
    SharedModule,
    MatTabsModule,
    MatFormFieldModule,
    MatExpansionModule,
    MatInputModule,
    MatDatepickerModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatPaginatorModule,
    MatDividerModule,
    MatTreeModule,
    MatSortModule,
    FormsModule,
    PdfViewerModule,
    ReactiveFormsModule,
    RouterModule.forChild(receivablesRoutes)  
  ]
})
export class ReceivablesModule { }
