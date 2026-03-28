import { AfterViewInit, Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-documents',
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.scss']
})
export class DocumentsComponent implements AfterViewInit {

  @ViewChild('expSoonPag') expSoonPag!: MatPaginator;
  @ViewChild('expiredPag') expiredPag!: MatPaginator;

  // ===========================
  //       DATA ARRAYS
  // ===========================
  documentList: any[] = [];
  filteredList: any[] = [];

  departmentList: string[] = [];
  documentTypes: string[] = [];

  selectedDepartment = '';
  selectedType = '';
  selectedStatus = '';

  searchText = '';

  // ===========================
  //       KPI METRICS
  // ===========================
  totalDocuments = 0;
  validDocuments = 0;
  expiredDocuments = 0;
  expiringSoon = 0;

  // ===========================
  //      CHART DATA
  // ===========================
  chartHeight = window.innerHeight * 0.4;

  statusChart: any[] = [];
  documentsByDept: any[] = [];
  documentsByType: any[] = [];
  expiryTrend: any[] = [];

  // ✅ NEW PIE CHARTS
  documentCategoryChart: any[] = [];
  expiryRiskChart: any[] = [];

  // ===========================
  //      RISK METRICS
  // ===========================
  highestExpiredDept: any;
  bestDept: any;
  topRiskType = '';
  fastestExpiringType = '';

  // ===========================
  //      TABLE DATA
  // ===========================
  expiringSoonList: any[] = [];
  expiringSoonPaged: any[] = [];
  expiredDocumentsList: any[] = [];
  expiredPaged: any[] = [];

  constructor(
    private reportService: ReportsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadDocuments();
  }

  ngAfterViewInit() {
    if (this.expSoonPag) {
      this.expSoonPag.page.subscribe(() => this.updateExpSoonPage());
    }

    if (this.expiredPag) {
      this.expiredPag.page.subscribe(() => this.updateExpiredPage());
    }
  }

  // ===========================
  //       LOAD DATA
  // ===========================
  loadDocuments() {
    this.reportService.getDocumentStatus().subscribe((res: any) => {
      this.documentList = res.recordset || [];
      this.filteredList = [...this.documentList];

      this.extractFilterData();
      this.calculateKPIs();
      this.prepareCharts();
      this.prepareTables();

      this.cdr.detectChanges();
    });
  }

  // ===========================
  //    FILTER OPTIONS
  // ===========================
  extractFilterData() {
    this.departmentList = [...new Set(this.documentList.map(x => x.DEPARTMENT_NAME))].filter(Boolean);
    this.documentTypes = [...new Set(this.documentList.map(x => x.DocumentName))].filter(Boolean);
  }

  filterDept() { this.applyFilters(); }
  filterType() { this.applyFilters(); }
  filterStatus() { this.applyFilters(); }

  applyFilters() {
    this.filteredList = this.documentList
      .filter(d => !this.selectedDepartment || d.DEPARTMENT_NAME === this.selectedDepartment)
      .filter(d => !this.selectedType || d.DocumentName === this.selectedType)
      .filter(d => !this.selectedStatus || d.Status === this.selectedStatus);

    this.calculateKPIs();
    this.prepareCharts();
    this.prepareTables();
  }

  // ===========================
  //       KPI METRICS
  // ===========================
  calculateKPIs() {
    const list = this.filteredList;

    this.totalDocuments = list.length;
    this.validDocuments = list.filter(d => d.Status === 'Valid').length;
    this.expiredDocuments = list.filter(d => d.Status === 'Expired').length;

    this.expiringSoon = list.filter(d => {
      const diff = this.daysToExpiry(d.ExpiryDate);
      return diff >= 0 && diff <= 30;
    }).length;
  }

  // ===========================
  //       CHART LOGIC
  // ===========================
  prepareCharts() {
    const list = this.filteredList;

    //--------------------------------------
    // ✅ 1. Status Pie Chart
    //--------------------------------------
    this.statusChart = this.formatGroup(this.groupCount(list, 'Status'));

    //--------------------------------------
    // ✅ 2. Documents by Department
    //--------------------------------------
    this.documentsByDept = this.formatGroup(this.groupCount(list, 'DEPARTMENT_NAME'));

    //--------------------------------------
    // ✅ 3. Documents by Type
    //--------------------------------------
    this.documentsByType = this.formatGroup(this.groupCount(list, 'DocumentName'));

    //--------------------------------------
    // ✅ 4. Expiry Trend
    //--------------------------------------
    const expiryByMonth: any = {};

    list.forEach(d => {
      const exp = new Date(d.ExpiryDate);
      if (!isNaN(exp.getTime())) {
        const key = `${exp.getFullYear()}-${(exp.getMonth() + 1).toString().padStart(2, '0')}`;
        expiryByMonth[key] = (expiryByMonth[key] || 0) + 1;
      }
    });

    this.expiryTrend = [
      {
        name: 'Expiring Documents',
        series: this.formatGroup(expiryByMonth)
      }
    ];

    //--------------------------------------
    // ✅ 5. Document Category Distribution (NEW)
    //--------------------------------------
    const categoryMap: any = {
      // Employment
      "CONTRACT": "Employment",
      "CONTRACT -APPR": "Employment",
      "CONTRACT APPR": "Employment",
      "APPRENTICESHIP": "Employment",
      "RENEWED CONTRACT": "Employment",
      "R.CONTRACT": "Employment",

      // Identity
      "CPR": "Identity",
      "CPR- WIFE": "Identity",
      "WIFE- CPR": "Identity",
      "PASSPORT": "Identity",
      "WIFE- PASSPORT": "Identity",
      "PASSPORT & RP": "Identity",
      "PASSPORT & RP- W": "Identity",
      "RP": "Identity",
      "RESIDENT PERMIT": "Identity",
      "WIFE RESIDENT PE": "Identity",

      // License
      "DRIVING LICENSE": "License & Certification",

      // Misc
      "OTHERS": "Misc",
      "OTHERS-PASSPORT": "Misc"
    };

    const categoryCounts: any = {};

    list.forEach(doc => {
      const raw = (doc.DocumentName || "").toUpperCase();

      const matchKey = Object.keys(categoryMap).find(k => raw.startsWith(k));
      const cat = matchKey ? categoryMap[matchKey] : "Misc";

      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    this.documentCategoryChart = this.formatGroup(categoryCounts);

    //--------------------------------------
    // ✅ 6. Expiry Risk Segmentation (NEW)
    //--------------------------------------
    let urgent = 0, upcoming = 0, safe = 0;

    list.forEach(d => {
      const days = this.daysToExpiry(d.ExpiryDate);

      if (days <= 30 && days >= 0) urgent++;
      else if (days <= 90 && days > 30) upcoming++;
      else if (days > 90) safe++;
    });

    this.expiryRiskChart = [
      { name: "0–30 Days", value: urgent },
      { name: "31–90 Days", value: upcoming },
      { name: "90+ Days", value: safe }
    ];

    //--------------------------------------
    // ✅ 7. Risk Metrics
    //--------------------------------------
    this.highestExpiredDept =
      this.documentsByDept.reduce((a, b) => (a.value > b.value ? a : b), { name: 'N/A', value: 0 });

    const deptValidPct = this.departmentList.map(dept => {
      const total = list.filter(d => d.DEPARTMENT_NAME === dept).length;
      const valid = list.filter(d => d.DEPARTMENT_NAME === dept && d.Status === 'Valid').length;
      return { name: dept, value: total ? (valid / total) * 100 : 0 };
    });

    this.bestDept = deptValidPct.reduce((a, b) => (a.value > b.value ? a : b), { name: 'N/A', value: 0 });

    this.topRiskType =
      this.documentsByType.reduce((a, b) => (a.value > b.value ? a : b), { name: '', value: 0 }).name;

    this.fastestExpiringType = this.getFastestExpiringType(list);
  }

  // ===========================
  //       TABLE LOGIC
  // ===========================
  prepareTables() {
    const list = this.filteredList;

    this.expiringSoonList = list
      .filter(d => {
        const diff = this.daysToExpiry(d.ExpiryDate);
        return diff >= 0 && diff <= 30;
      })
      .sort((a, b) => new Date(a.ExpiryDate).getTime() - new Date(b.ExpiryDate).getTime());

    this.updateExpSoonPage();

    this.expiredDocumentsList = list
      .filter(d => this.daysToExpiry(d.ExpiryDate) < 0)
      .sort((a, b) => new Date(b.ExpiryDate).getTime() - new Date(a.ExpiryDate).getTime());

    this.updateExpiredPage();
  }

  updateExpSoonPage() {
    if (!this.expSoonPag) {
      this.expiringSoonPaged = this.expiringSoonList.slice(0, 10);
      return;
    }
    const start = this.expSoonPag.pageIndex * this.expSoonPag.pageSize;
    this.expiringSoonPaged = this.expiringSoonList.slice(start, start + this.expSoonPag.pageSize);
  }

  updateExpiredPage() {
    if (!this.expiredPag) {
      this.expiredPaged = this.expiredDocumentsList.slice(0, 10);
      return;
    }
    const start = this.expiredPag.pageIndex * this.expiredPag.pageSize;
    this.expiredPaged = this.expiredDocumentsList.slice(start, start + this.expiredPag.pageSize);
  }

  // ===========================
  //     UTILITY FUNCTIONS
  // ===========================
  daysToExpiry(dateStr: string): number {
    const today = new Date().setHours(0, 0, 0, 0);
    const exp = new Date(dateStr).setHours(0, 0, 0, 0);
    return Math.floor((exp - today) / (1000 * 60 * 60 * 24));
  }

  groupCount(arr: any[], key: string) {
    return arr.reduce((acc, cur) => {
      const val = cur[key] || 'Unknown';
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }

  formatGroup(obj: any) {
    return Object.entries(obj).map(([name, value]) => ({ name, value }));
  }

  getFastestExpiringType(list: any[]) {
    const typeAge: any = {};

    list.forEach(d => {
      const days = this.daysToExpiry(d.ExpiryDate);
      if (!typeAge[d.DocumentName]) {
        typeAge[d.DocumentName] = [];
      }
      typeAge[d.DocumentName].push(days);
    });

    const avgAges = Object.entries(typeAge).map(([name, ages]: any) => ({
      name,
      value: ages.reduce((a: number, b: number) => a + b, 0) / ages.length
    }));

    return avgAges.reduce((a, b) => (a.value < b.value ? a : b), { name: '', value: 99999 }).name;
  }

  // ===========================
  //     EXPORT FUNCTION
  // ===========================
  exportDocuments() {
    const link = document.createElement('a');
    link.href = 'assets/reports/documents.xlsx';
    link.click();
  }
}