import { Component } from '@angular/core';
import { ReportsService } from 'src/app/services/reports/reports.service';
import { LegendPosition } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  legendPosition: LegendPosition = LegendPosition.Right;

  custCount: number = 0;
  busiCount: number = 0;
  emplCount: number = 0;
  stckCount: number = 0;
  jobsCount: number = 0;
  suppCount: number = 0;
  topBusiList: any[] = [];
  topCustList: any[] = [];
  topSuppList: any[] = [];
  topProdList: any[] = [];
  topLocaList: any[] = [];
  countrywiseYearwiseChartData: any[] = []
  monthwiseSalesdata: any[] = []
  monthlySales: any[] = []
  topFastBrands: { [key: number]: any[] } = {}; // keyed by months
  topSlowBrands: { [key: number]: any[] } = {};
  displayFastBrands: any[] = [];
  displaySlowBrands: any[] = [];

  periods = [1, 3, 6, 12];

  constructor(private reportService : ReportsService) {
    this.getARData();
  }

  getARData(){
    this.reportService.getCustomerList('C').subscribe((res: any) => {
      this.custCount = res.length
    })  
    this.reportService.getCustomerList('C').subscribe((res: any) => {
      this.topCustList = res.recordset
    })
    this.reportService.getProductList().subscribe((res: any) => {
      this.topProdList = res.recordset
    })    
    this.reportService.listAllBusinessCenters().subscribe((res: any) => {
      this.busiCount = res.length
    })
    this.reportService.getallemp().subscribe((res: any) => {
      this.emplCount = res.rowsAffected
    })
    this.reportService.listAllJobs().subscribe((res: any) => {
      this.jobsCount = res.length
    })
    this.reportService.getproductcount().subscribe((res: any) => {
      this.stckCount = res[0].PRODCTCOUNT
    })

this.reportService.getallorders().subscribe((res: any) => {
  const raw = res; // response array

  // Helper: get month key 'YYYY-MM'
  const getMonthKey = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  };

  // Step 1: Filter last 12 months
  const now = new Date();
  const lastYear = new Date();
  lastYear.setFullYear(now.getFullYear() - 1);

  const filtered = raw.filter((item: any) => {
    if (!item["SO Date"]) return false;
    const date = new Date(item["SO Date"]);
    return date >= lastYear && date <= now;
  });

  // Step 2: Group and sum
  const grouped: { [key: string]: number } = {};
  filtered.forEach((item: any) => {
    const key = getMonthKey(item["SO Date"]);
    const val = parseFloat(item["SO Total"] || "0");
    grouped[key] = (grouped[key] || 0) + val;
  });

  // Step 3: Sort by date
  const sortedKeys = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  // Step 4: Map to chart format
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthSeries = sortedKeys.map(k => {
    const [year, month] = k.split('-');
    const monthIndex = parseInt(month, 10) - 1;
    return {
      name: `${monthNames[monthIndex]} ${year}`,
      value: grouped[k]
    };
  });

  this.monthwiseSalesdata = [
    { name: 'Total Orders', series: monthSeries }
  ];

});




    this.reportService.getCustomerList('S').subscribe((res: any) => {
      this.suppCount = res.length
    })
    this.reportService.getBusinessList('S').subscribe((res: any) => {
      this.topSuppList = res.recordset
    })

  }


  onTabChange(event: any, type: 'fast' | 'slow') {
    const months = this.periods[event.index];
    if (type === 'fast') {
      this.displayFastBrands = this.topFastBrands[months] || [];
    } else {
      this.displaySlowBrands = this.topSlowBrands[months] || [];
    }
  }
}




