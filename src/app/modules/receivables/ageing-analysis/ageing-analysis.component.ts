import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-ageing-analysis',
  templateUrl: './ageing-analysis.component.html',
  styleUrls: ['./ageing-analysis.component.scss']
})
export class AgeingAnalysisComponent {


ageingData: any[] = [];
  searchText = "";

  kpiCards: any[] = [];
  ageingBucketChart: any[] = [];
  overduePie: any[] = [];
  salespersonChart: any[] = [];
  salespersonAgeingHeatmap: any[] = [];
  topCustomers: any[] = [];

    constructor(private financeService: FinanceService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private accountService: AccountsService, private reportService: ReportsService, private dataSharingService: DataSharingService, private cdr: ChangeDetectorRef) { }


ngOnInit() {
    this.loadAgeing();
  }

  loadAgeing() {
    this.reportService.getCustAge().subscribe((res: any) => {
      this.ageingData = res;
      this.buildKPIs();
      this.buildAgeingBuckets();
      this.buildOverdueSplit();
      this.buildSalespersonCharts();
      this.buildTopCustomers();
    });
  }

  
 // ---------------- KPIs ----------------
  
buildKPIs() {

  let totalOutstanding = 0;
  let overdue = 0;
  let notDue = 0;

  let due30 = 0;
  let due60 = 0;
  let due90 = 0;

  this.ageingData.forEach(e => {
    const bal = +e.Balance || 0;
    const daysDue = +e["Days Due"] || 0;

    totalOutstanding += bal;

    if (daysDue > 0) {
      overdue += bal;
    } else {
      notDue += bal;

      // Future buckets
      if (daysDue >= -30) {
        due30 += bal;
      } else if (daysDue >= -60) {
        due60 += bal;
      } else if (daysDue >= -90) {
        due90 += bal;
      }
    }
  });

  this.kpiCards = [
    { label: 'Total Outstanding', value: totalOutstanding, color: '#F59E0B' },
    { label: 'Overdue', value: overdue, color: '#EF4444' },
    { label: 'Not Due', value: notDue, color: '#10B981' },

    /* NEW KPIs */
    { label: 'Due in Next 30 Days', value: due30, color: '#3B82F6' },
    { label: 'Due in Next 60 Days', value: due60, color: '#6366F1' },
    { label: 'Due in Next 90 Days', value: due90, color: '#8B5CF6' },
  ];
}


  
  // ---------------- Ageing Buckets ----------------
  buildAgeingBuckets() {
    const buckets = [
      '0-30 Days','31-60 Days','61-90 Days',
      '91-120 Days','121-364 Days','>1 YEAR'
    ];

    this.ageingBucketChart = buckets.map(b => ({
      name: b,
      value: this.ageingData.reduce((a, e) => a + (+e[b] || 0), 0)
    }));
  }

  
 // ---------------- Overdue Split ----------------
  buildOverdueSplit() {
    const overdue = this.ageingData
      .filter(e => e["Days Due"] > 0)
      .reduce((a, b) => a + (+b.Balance || 0), 0);

    const notDue = this.ageingData
      .filter(e => e["Days Due"] <= 0)
      .reduce((a, b) => a + (+b.Balance || 0), 0);

    this.overduePie = [
      { name: 'Overdue', value: overdue },
      { name: 'Not Due', value: notDue }
    ];
  }

  
// ---------------- Salesperson ----------------
  buildSalespersonCharts() {
    const spTotals: any = {};
    const heatmap: any = {};

    this.ageingData.forEach(e => {
      const sp = e['Sales Person'] || 'Unassigned';
      const bal = +e.Balance || 0;

      spTotals[sp] = (spTotals[sp] || 0) + bal;
      heatmap[sp] = heatmap[sp] || {};

      ['0-30 Days','31-60 Days','61-90 Days','91-120 Days','>1 YEAR']
        .forEach(b => {
          heatmap[sp][b] = (heatmap[sp][b] || 0) + (+e[b] || 0);
        });
    });

    this.salespersonChart = Object.entries(spTotals)
      .map(([name, value]) => ({ name, value }));

    this.salespersonAgeingHeatmap = Object.entries(heatmap)
      .map(([sp, buckets]: any) => ({
        
name: sp,
        series: Object.entries(buckets).map(([b, v]) => ({ name: b, value: v }))
      }));
  }

  // ---------------- Top Customers ----------------
  buildTopCustomers() {
    const cust: any = {};

    this.ageingData.forEach(e => {
      const name = e['Customer Name'];
      if (!cust[name]) {
        cust[name] = { total: 0, days: 0, contact: e['contact person'] };
      }
      cust[name].total += +e.Balance || 0;
      cust[name].days = Math.max(cust[name].days, e["Days Due"] || 0);
    });

    this.topCustomers = Object.entries(cust)
      .map(([name, v]: any) => ({ name, ...v }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);
  }


get filteredInvoices() {
    return this.ageingData.filter(e =>
      JSON.stringify(e).toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
