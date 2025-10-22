import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-demography',
  templateUrl: './demography.component.html',
  styleUrls: ['./demography.component.scss']
})
export class DemographyComponent {
  empList: any[] = []
  searchText = ""

  constructor(private financeService: FinanceService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private accountService: AccountsService, private reportService: ReportsService, private dataSharingService: DataSharingService) { 
    this.reportService.getallemp().subscribe((res: any) => {
      this.empList = res.recordset
      console.log(res)
    })
  }

  exportEmployeeDemographics() {
    const link = document.createElement('a');
    link.href = 'assets/reports/employee_count.xlsx';
    link.click();
  }

}
