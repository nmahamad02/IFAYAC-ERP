import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-service-calls',
  templateUrl: './service-calls.component.html',
  styleUrls: ['./service-calls.component.scss']
})
export class ServiceCallsComponent {

  callList: any[] = []
  searchText = ""

  constructor(private financeService: FinanceService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private accountService: AccountsService, private reportService: ReportsService, private dataSharingService: DataSharingService) { 
    this.reportService.getallorders().subscribe((res: any) => {
      this.callList = res
      console.log(res)
    })
  }

  exportServiceCalls() {
    const link = document.createElement('a');
    link.href = 'assets/reports/yac-Order_analysis-2025-all.xlsx';
    link.click();
  }
}
