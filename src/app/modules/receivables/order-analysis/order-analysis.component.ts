import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-order-analysis',
  templateUrl: './order-analysis.component.html',
  styleUrls: ['./order-analysis.component.scss']
})
export class OrderAnalysisComponent {
  soList: any[] = []
  searchText = ""

  chartWidth = 0;
  chartHeight = window.innerWidth * 0.4;
  ready = false;

  salespersonChart: any[] = [];
  customerChart: any[] = [];
  monthlySOAvgChart: any[] = [];
  topCustomers: any[] = [];
  yearlySOChart: any[] = [];
 momGrowthChart: any[] = [];

  yearwiseComparisonChart: any[] = [];
  remarksChart: any[] = []
customerRetention = {
  totalCustomers: 0,
  repeatCustomers: 0,
  retentionRate: 0
};

  stats = {
    salespeople: 0,
    customers: 0,
    remarks: 0,
    ordersThisYear: 0,
    revenueThisYear: 0,
    ordersThisMonth: 0,
  };

  selectedRemark: string = "";
  remarksList: string[] = [];
  salespersonBCHeatmap: any[] = [];

  cYear = new Date().getFullYear();

  availableYears: number[] = [];

  currentPage = 0;
  pageSize = 10;

  colorScheme = {
    domain: ['#3366cc', '#dc3912', '#ff9900', '#109618', '#990099']
  };

ngOnInit() {
  this.setChartSize();
  this.loadData();
}
  
  async loadData() {
    this.fetchSalesOrders(); 
    this.ready = true;
  }
  
  constructor(private financeService: FinanceService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private accountService: AccountsService, private reportService: ReportsService, private dataSharingService: DataSharingService, private cdr: ChangeDetectorRef) { }

  setChartSize() {
    this.chartWidth = Math.floor(window.innerWidth * 1);
    this.chartHeight = Math.floor(window.innerHeight * 0.4);
  }

fetchSalesOrders() {
  this.reportService.getallorders().subscribe((res: any) => {
    this.soList = res;

    // Build list of all years in dataset
    this.availableYears = Array.from(new Set(this.soList.map(e => new Date(e["SO Date"]).getFullYear()))).sort((a, b) => b - a);

    //this.prepareCharts();
    this.computeStats();
    this.buildRemarksChart();
    this.prepareSalespersonChart();
    this.prepareTopCustomers();
    this.remarksList = Array.from(new Set(this.soList.map(e => e.Remark ?? "Unknown")));
    this.ready = true;
  });
}


onYearChange() {
  // Only recompute the reports that are year-dependent
  this.computeStats();
  this.buildRemarksChart();
  this.prepareSalespersonChart();
  this.prepareTopCustomers();
}


computeStats() {
  if (!this.soList || this.soList.length === 0) return;

  const currentYear = this.cYear;
  const currentMonth = new Date().getMonth(); // optional: could also adjust month logic if desired

  const salespeopleSet = new Set();
  const customersSet = new Set();
  const remarksSet = new Set();

  let ordersThisYear = 0;
  let revenueThisYear = 0;
  let ordersThisMonth = 0;

  this.soList.forEach((so: any) => {
    const date = new Date(so["SO Date"]);
    if (isNaN(date.getTime())) return;

    if (so.SlpCode) salespeopleSet.add(so.SlpCode);
    if (so.CardCode) customersSet.add(so.CardCode);
    if (so.Remark) remarksSet.add(so.Remark);

    const year = date.getFullYear();
    const month = date.getMonth();

    if (year === currentYear) {
      ordersThisYear++;
      revenueThisYear += parseFloat(so["SO Total"] || 0);

      if (month === currentMonth) ordersThisMonth++;
    }
  });

  this.stats = {
    salespeople: salespeopleSet.size,
    customers: customersSet.size,
    remarks: remarksSet.size,
    ordersThisYear,
    revenueThisYear,
    ordersThisMonth
  };

  const monthNames = [ "Jan","Feb","Mar","Apr","May","Jun", "Jul","Aug","Sep","Oct","Nov","Dec" ]; 
  const previousYear = currentYear - 1; 
  const evenPreviousYear = previousYear - 1; 
  // Parse dataset into usable objects 
  const parsed = this.soList.map(r => ({ 
    date: new Date(r["SO Date"]), 
    total: parseFloat(r["SO Total"]) 
  })); 
  // Buckets for both years 
  const currentYearMonths: Record<number, number[]> = {}; 
  const previousYearMonths: Record<number, number[]> = {}; 
  const evenPreviousYearMonths: Record<number, number[]> = {}; 
  // Fill buckets 
  parsed.forEach(r => { 
    const y = r.date.getFullYear(); 
    const m = r.date.getMonth(); // 0–11 
    if (y === currentYear) { 
      if (!currentYearMonths[m]) currentYearMonths[m] = []; 
      currentYearMonths[m].push(r.total); 
    } 
    
    if (y === previousYear) { 
      if (!previousYearMonths[m]) previousYearMonths[m] = []; 
      previousYearMonths[m].push(r.total); 
    } 
    
    if (y === evenPreviousYear) { 
      if (!evenPreviousYearMonths[m]) evenPreviousYearMonths[m] = []; 
      evenPreviousYearMonths[m].push(r.total); 
    } 
  }); 
  
  // Ensure Jan–Dec order 
  const monthIndexes = [...Array(12).keys()]; 
  // Current year series 
  const currentYearSeries = monthIndexes.map(m => ({ 
    name: monthNames[m], 
    value: currentYearMonths[m] ? currentYearMonths[m].reduce((a, b) => a + b, 0) : 0 
  })); 
  // Previous year series 
  const previousYearSeries = monthIndexes.map(m => ({ 
    name: monthNames[m], 
    value: previousYearMonths[m] ? previousYearMonths[m].reduce((a, b) => a + b, 0) : 0 
  })); 
  // evenPrevious year series 
  const evenPreviousYearSeries = monthIndexes.map(m => ({ 
    name: monthNames[m], 
    value: evenPreviousYearMonths[m] ? evenPreviousYearMonths[m].reduce((a, b) => a + b, 0) : 0 
  })); 
  // Final chart dataset 
  this.yearwiseComparisonChart = [ 
    { 
      name: `${currentYear} Revenue`, 
      series: currentYearSeries 
    }, 
    { 
      name: `${previousYear} Revenue`,
      series: previousYearSeries 
    }, 
    { 
      name: `${evenPreviousYear} Revenue`, 
      series: evenPreviousYearSeries 
    } 
  ];

  const yearTotals: any = {}; 
  this.soList.forEach(e => { 
    const date = new Date(e["SO Date"]); 
    const year = date.getFullYear(); 
    const total = parseFloat(e["SO Total"] ?? 0); 
    
    yearTotals[year] = (yearTotals[year] || 0) + total; 
  }); 
  this.yearlySOChart = [ 
    { 
      name: "Yearly SO Total", 
      series: Object.entries(yearTotals).map(([year, total]) => ({ 
        name: year, 
        value: total 
      })) 
    } 
  ];

  // ----------------------
// Month-on-Month Growth
// ----------------------
const current = currentYearSeries.map(m => m.value);

const mom = current.map((val, idx) => {
  if (idx === 0) return 0; // no previous month
  const prev = current[idx - 1] || 0;
  if (prev === 0) return 0;
  return ((val - prev) / prev) * 100;
});

// Build chart structure
this.momGrowthChart = [
  {
    name: "MoM Growth (%)",
    series: mom.map((g, idx) => ({
      name: monthNames[idx],
      value: Number(g.toFixed(2))
    }))
  }
];

// ----------------------
// Customer Retention
// ----------------------
const custMap: Record<string, number> = {};
this.soList.forEach(so => {
  const cust = so.CardCode;
  if (!cust) return;
  custMap[cust] = (custMap[cust] || 0) + 1;
});

const totalCust = Object.keys(custMap).length;
const repeatCust = Object.values(custMap).filter(c => c > 1).length;

this.customerRetention = {
  totalCustomers: totalCust,
  repeatCustomers: repeatCust,
  retentionRate: totalCust ? Number(((repeatCust / totalCust) * 100).toFixed(2)) : 0
};


}

// --------------------------
// Split salesperson pie logic so it can refresh independently
// --------------------------
prepareSalespersonChart() {
  if (!this.soList || this.soList.length === 0) return;

  //const filtered = this.soList.filter(so => new Date(so["SO Date"]).getFullYear() === this.cYear);
  const filtered = this.filteredSO;
  const slpGroups = this.groupCount(filtered, "SlpName");

  this.salespersonChart = Object.entries(slpGroups).map(([name, value]) => ({
    name,
    value
  }));
  this.buildSalespersonBusinessCentreHeatmap();
}

// --------------------------
// Top customers chart
// --------------------------
prepareTopCustomers() {
  if (!this.soList || this.soList.length === 0) return;

  //const filtered = this.soList.filter(so => new Date(so["SO Date"]).getFullYear() === this.cYear);
  const filtered = this.filteredSO;
  const custTotals: Record<string, number> = {};

  filtered.forEach(e => {
    const cust = e.CardName || "Unknown";
    const total = parseFloat(e["SO Total"] ?? 0);
    custTotals[cust] = (custTotals[cust] || 0) + total;
  });

  this.topCustomers = Object.entries(custTotals)
    .map(([name, total]) => ({ name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10);
}

// --------------------------
// Remarks chart
// --------------------------
buildRemarksChart() {
  if (!this.soList || this.soList.length === 0) return;

  const filtered = this.soList.filter(so => new Date(so["SO Date"]).getFullYear() === this.cYear);
  const remarkBuckets: Record<string, number> = {};

  filtered.forEach(so => {
    const remark = so.Remark || "Unknown";
    const total = parseFloat(so["SO Total"] || 0);
    remarkBuckets[remark] = (remarkBuckets[remark] || 0) + total;
  });

  this.remarksChart = Object.entries(remarkBuckets).map(([name, value]) => ({ name, value }));
  this.remarksChart.sort((a, b) => b.value - a.value);
}

  // Helper: group by functions
  groupCount(array: any[], key: string) {
    return array.reduce((acc, cur) => {
      const val = cur[key] || 'Unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  formatGroup(obj: any) {
    const arr = Object.entries(obj).map(([name, value]) => ({ name, value }));
    // If all names are numeric or YYYY-type strings, sort ascending
    if (arr.every(a => /^\d{4}/.test(a.name))) {
      arr.sort((a, b) => +a.name - +b.name);
    }
    return arr;
  }

  groupByDate(array: any[], key: string, mode: 'month' | 'year') {
    const grouped: any = {};
    array.forEach(e => {
      const dateVal = e[key];
      if (!dateVal) return;
      const date = new Date(dateVal);
      const label = mode === 'month'? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`: `${date.getFullYear()}`;
      grouped[label] = (grouped[label] || 0) + 1;
    });
    return grouped;
  }

  buildSalespersonBusinessCentreHeatmap() {
  if (!this.soList.length) return;

  const filtered = this.soList.filter(
    so => new Date(so["SO Date"]).getFullYear() === this.cYear
  );

  // Matrix: salesperson → remark → sum of totals
  const matrix: Record<string, Record<string, number>> = {};

  filtered.forEach(so => {
    const sp = so.SlpName || "Unknown";
    const bc = so.Remark || "Unknown";
    const total = parseFloat(so["SO Total"] || 0);

    if (!matrix[sp]) matrix[sp] = {};
    matrix[sp][bc] = (matrix[sp][bc] || 0) + total;
  });

  // Convert to ngx-charts format
  this.salespersonBCHeatmap = Object.entries(matrix).map(([sp, centres]) => ({
    name: sp,
    series: Object.entries(centres).map(([bc, total]) => ({
      name: bc,
      value: total
    }))
  }));
}


  onRemarkChange() {
    this.prepareSalespersonChart();
    this.prepareTopCustomers();
   // this.buildRemarksChart();
  }

  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
  }


  get filteredSO() {
    return this.soList.filter(so => {
      const yearMatch = new Date(so["SO Date"]).getFullYear() === this.cYear;
      const remarkMatch = !this.selectedRemark || so.Remark === this.selectedRemark;
      return yearMatch && remarkMatch;
    });
  }


}
