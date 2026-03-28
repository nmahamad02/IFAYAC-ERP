import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';
import { ChangeDetectorRef } from '@angular/core';
import * as shape from 'd3-shape';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { HrService } from 'src/app/services/hr/hr.service';
import * as go from 'gojs';
import { of, forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-demography',
  templateUrl: './demography.component.html',
  styleUrls: ['./demography.component.scss']
})
export class DemographyComponent implements AfterViewInit {
    
  @ViewChild('birthdayPaginator') birthdayPaginator!: MatPaginator;
  @ViewChild('anniversaryPaginator') anniversaryPaginator!: MatPaginator;

  /*********** New Code **********/

  empno = JSON.parse(localStorage.getItem('empno')!);
  @ViewChild('diagramDiv', { static: true }) diagramRef!: ElementRef;
  private diagram!: go.Diagram;

  divisionList: any[] = []
  departmentList: any[] = []
  lineList: any[] = []

divisionLocked = false;
departmentLocked = false;
lineLocked = false;

  empCode = this.empno;

  selectedDivision = ''
  selectedDepartment = ''
  selectedLine = ''

  /*********** New Code **********/

  empList: any[] = []
  searchText = ""
  avgTenure: number | string;
  avgAge: number | string;

  // Chart data
  activeStatusData: any[] = [];
  departmentData: any[] = [];
  designationData: any[] = [];
  nationalityData: any[] = [];
  genderData: any[] = [];
  religionData: any[] = [];
  bahrainisationData: any[] = [];
  bahrainisationPercent: string = '0';

  // Chart options
  showLegend = true;
  showLabels = true;
  isDoughnut = true;
  colorScheme = { domain: ['#0066CC', '#FF6600', '#00AA88', '#CC3333', '#FFD700'] };
  joinTrendData: { name: string; series: any; }[];
  attritionTrendData: { name: string; series: unknown; }[];
  joinAttritionTrendData: { name: string; series: unknown; }[];
  avgTenureByDept: { name: any; value: number; }[];
  ageDistributionData: any[]
  nationalityMixPercent: any[];
  maxDept: any;
  deptOldest: { name: string; value: string | number; };
  deptYoungest: { name: string; value: string | number; };
  minDept: any;

chartWidth = 0;
chartHeight = window.innerWidth //* 0.3;

ready = false;
  longestServing: any;
  ageVsDesignationData: any
  upcomingBirthdays = new MatTableDataSource<any>();
  pagedBirthdays: any[] = [];

  upcomingAnniversaries= new MatTableDataSource<any>();
  pagesAnniversaries: any[] = [];

  ageDistributionCurve: any;

ngOnInit() {
  this.setChartSize();

  if (this.empCode == 707) {

  // CEO can select everything
  this.divisionLocked = false;
  this.departmentLocked = false;
  this.lineLocked = false;

  this.getDivisionManagers();

} else {

  this.initializeFromWhoAmI();

}

  this.loadData();
}

initializeFromWhoAmI() {

  this.hrService.whoami(this.empCode).subscribe((res: any) => {

    const data = res.recordset || res;

    const division = data.find((x: any) => x.Level === 2);
    const department = data.find((x: any) => x.Level === 3);
    const line = data.find((x: any) => x.Level === 4);

    this.divisionLocked = false;
    this.departmentLocked = false;
    this.lineLocked = false;

    // LEVEL 4
    if (line) {

      this.divisionLocked = true;
      this.departmentLocked = true;
      this.lineLocked = true;

      this.getDivisionManagers(() => {
        this.selectedDivision = division?.empid || '';
        this.getDepartmentManagers(() => {
          this.selectedDepartment = department?.empid || '';
          this.getLineManagers(() => {
            this.selectedLine = line.empid;
            this.loadOrgChart(line.empid);
          });
        });
      });
      return;
    }

    // LEVEL 3
    if (department) {

      this.divisionLocked = true;
      this.departmentLocked = true;

      this.getDivisionManagers(() => {
        this.selectedDivision = division?.empid || '';
        this.getDepartmentManagers(() => {
          this.selectedDepartment = department.empid;
          this.getLineManagers();
          this.loadOrgChart(department.empid);
        });
      });
      return;
    }

    // LEVEL 2
    if (division) {
      this.divisionLocked = true;
      this.getDivisionManagers(() => {
        this.selectedDivision = division.empid;
        this.getDepartmentManagers();
        this.loadOrgChart(division.empid);
      });
      return;
    }
  });

}

ngAfterViewInit() {
  if (!this.birthdayPaginator) return;

  this.birthdayPaginator.page.subscribe(() => {
    this.updatePagedBirthdays();
  });

  if (!this.anniversaryPaginator) return;

  this.anniversaryPaginator.page.subscribe(() => {
    this.updatePagedAnniversaries();
  });





const $ = go.GraphObject.make;

this.diagram = $(go.Diagram, this.diagramRef.nativeElement, {
  layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 }),
  "undoManager.isEnabled": true
});

this.diagram.nodeTemplate =
  $(go.Node, "Auto",
    $(go.Shape, "RoundedRectangle",
      { strokeWidth: 0, fill: "#ffffff", stroke: "#d0d0d0" }
    ),
    $(go.Panel, "Horizontal",
      { padding: 8 },

      // Avatar
      $(go.Picture,
        {
          width: 50,
          height: 50,
          margin: 6,
          imageStretch: go.GraphObject.UniformToFill
        },
        new go.Binding("source", "avatar")
      ),

      // Text block
      $(go.Panel, "Vertical",
        $(go.TextBlock,
          { font: "bold 13px sans-serif" },
          new go.Binding("text", "name")
        ),
        $(go.TextBlock,
          { font: "11px sans-serif", stroke: "#555" },
          new go.Binding("text", "title")
        ),
        $(go.TextBlock,
          { font: "10px sans-serif", stroke: "#888" },
          new go.Binding("text", "dept")
        )
      )
    )
  );



  /*const $ = go.GraphObject.make;

    const diagram = $(go.Diagram, this.diagramRef.nativeElement, {
      layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 }),
      "undoManager.isEnabled": true
    });

    // Node template
    diagram.nodeTemplate =
      $(go.Node, "Auto",
        $(go.Shape, "RoundedRectangle",
          { strokeWidth: 0, fill: "lightblue" },
          new go.Binding("fill", "color")
        ),
        $(go.TextBlock,
          { margin: 8, font: "bold 13px sans-serif" },
          new go.Binding("text", "name")
        )
      );

    // Org data
    diagram.model = new go.TreeModel([
      { key: 1, name: "CEO", color: "#ffd966" },
      { key: 2, parent: 1, name: "CTO" },
      { key: 3, parent: 1, name: "CFO" },
      { key: 4, parent: 2, name: "Dev Manager" },
      { key: 5, parent: 4, name: "Developer" }
    ]);*/
}

/*buildOrgDiagram(data: any[]) {
  const $ = go.GraphObject.make;

  const diagram = $(go.Diagram, this.diagramRef.nativeElement, {
    layout: $(go.TreeLayout, { angle: 90, layerSpacing: 35 }),
    "undoManager.isEnabled": true
  });

  diagram.nodeTemplate =
    $(go.Node, "Auto",
      $(go.Shape, "RoundedRectangle",
        { strokeWidth: 0, fill: "lightblue" },
        new go.Binding("fill", "color")
      ),
      $(go.Panel, "Vertical",
        $(go.TextBlock,
          { margin: 4, font: "bold 13px sans-serif" },
          new go.Binding("text", "name")
        ),
        $(go.TextBlock,
          { margin: 2, font: "11px sans-serif", stroke: "#555" },
          new go.Binding("text", "title")
        )
      )
    );

  // 🔥 convert API → TreeModel
  const modelData = data.map(e => ({
    key: e.empid,
    parent: e.reportto || undefined,
    name: e.empname,
    title: e.designationDs,
    dept: e.deptds,
    level: e.Level
  }));

  diagram.model = new go.TreeModel(modelData);
}*/

buildOrgDiagram(data: any[]) {
  if (!this.diagram) return;

  const unique = new Map<number, any>();

  data.forEach(e => {
    unique.set(e.empid, {
      key: e.empid,
      parent: e.reportto || undefined,
      name: e.empname,
      title: e.designationDs,
      dept: e.deptds,
      avatar: this.bufferToBase64(e.ImageStream) || '',
      level: e.Level
    });
  });

  this.diagram.model = new go.TreeModel(Array.from(unique.values()));
}
/*
loadOrgChart(empCode: string) {
  forkJoin({
    lineage: this.hrService.whoami(empCode),
    team: this.hrService.getMyTeam(empCode)
  }).subscribe(({ lineage, team }: any) => {

    const teamMembers = team.recordset || [];

    // Merge both arrays
    const combined = [...lineage, ...teamMembers];

    this.buildOrgDiagram(combined);
  });
}*/

loadOrgChart(empCode: string) {
  forkJoin({
    lineage: this.hrService.whoami(empCode),
    team: this.hrService.getMyTeam(empCode)
      .pipe(
        // never fail; return empty array if API errors
        catchError(err => {
          console.warn('No downstream employees', err);
          return of({ recordset: [] });
        })
      )
  }).subscribe(({ lineage, team }: any) => {

    const teamMembers = team?.recordset || [];

    // Merge upstream lineage + downstream team
    const combined = [...(lineage?.recordset || lineage || []), ...teamMembers];

    // Build chart even if teamMembers is empty
    this.buildOrgDiagram(combined);
  });
}

async loadData() {
  await this.fetchEmployees(); // or however you get empList
  this.prepareCharts();
  this.ready = true;
}

  constructor(private financeService: FinanceService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private hrService: HrService, private reportService: ReportsService, private dataSharingService: DataSharingService, private cdr: ChangeDetectorRef) { 
    console.log(this.empCode)
  }

getDivisionManagers(callback?: () => void) {

  this.hrService.getMyTeam(this.empCode).subscribe((res: any) => {

    this.divisionList = res.recordset || [];

    // Update charts when division level selected
    if (this.selectedDivision) {
      this.hrService.getMyTeam(this.selectedDivision).subscribe((team: any) => {

        this.empList = team.recordset || [];
        this.prepareCharts();
        this.loadOrgChart(this.selectedDivision);

      }, (err: any) => {
                this.loadOrgChart(this.selectedDivision);
    //alert('No breakdown for selected employee!')
  });
    }

    if (callback) callback();
  });

}

getDepartmentManagers(callback?: () => void) {

  if (!this.selectedDivision) return;

  this.hrService.getMyTeam(this.selectedDivision).subscribe((res: any) => {

    this.departmentList = res.recordset || [];

    // Update charts for department selection
    this.empList = res.recordset || [];
    this.prepareCharts();
    this.loadOrgChart(this.selectedDivision);

    if (callback) callback();
  }, (err: any) => {
        this.loadOrgChart(this.selectedDivision);
    //alert('No breakdown for selected employee!')
  });

}

getLineManagers(callback?: () => void) {

  if (!this.selectedDepartment) return;

  this.hrService.getMyTeam(this.selectedDepartment).subscribe((res: any) => {

    this.lineList = res.recordset || [];

    // Update charts for department level
    this.empList = res.recordset || [];
    this.prepareCharts();
    this.loadOrgChart(this.selectedDepartment);

    if (callback) callback();
  }, (err: any) => {
        this.loadOrgChart(this.selectedDivision);
    //alert('No breakdown for selected employee!')
  });

}

getTeamEmployees() {
  if (!this.selectedLine) return;
  this.hrService.getMyTeam(this.selectedLine).subscribe((res: any) => {
    this.empList = res.recordset || [];
    this.prepareCharts();
    this.loadOrgChart(this.selectedLine);
  }, (err: any) => {
    this.loadOrgChart(this.selectedLine);
    //alert('No breakdown for selected employee!')
  });
}

  fetchEmployees() {
    this.reportService.getallemployees().subscribe((res: any) => {
      this.empList = res.recordset
      console.log(res.recordset)
      this.prepareCharts()
    })
  }

  exportEmployeeDemographics() {
    const link = document.createElement('a');
    link.href = 'assets/reports/employee_count.xlsx';
    link.click();
  }

  prepareCharts() {
    // ✅ 1️⃣ Active vs Inactive — whole dataset
    const activeCount = this.empList.filter(e => e.Active === true).length;
    const inactiveCount = this.empList.length - activeCount;
    this.activeStatusData = [
      { name: 'Active', value: activeCount },
      { name: 'Inactive', value: inactiveCount }
    ];

    // 🔍 Now focus only on active employees for other charts
    const activeEmployees = this.empList.filter(e => e.Active === true);

this.longestServing = activeEmployees.reduce((a, b) => {
  const joinA = new Date(a.joindt).getTime();
  const joinB = new Date(b.joindt).getTime();
  return joinA <= joinB ? a : b;
}, { name: 'N/A', joindt: null });



    // ✅ 2️⃣ Count by Department (active only)
    const byDept = this.groupCount(activeEmployees, 'deptds');
    this.departmentData = this.formatGroup(byDept);

    // ✅ 3️⃣ Count by Designation Level (active only)
    const byDesig = this.groupCount(activeEmployees, 'designationDs');
    this.designationData = this.formatGroup(byDesig);

    // ✅ 4️⃣ Nationalities Breakdown (active only)
    const byNationality = this.groupCount(activeEmployees, 'Nation');
    this.nationalityData = this.formatGroup(byNationality);

    // ✅ 4️⃣ Gender Breakdown (active only)
    const byGender = this.groupCount(activeEmployees, 'gender');
    this.genderData = this.formatGroup(byGender);

    // ✅ 4️⃣ Religion Breakdown (active only)
    const byReligion = this.groupCount(activeEmployees, 'religionName');
    this.religionData = this.formatGroup(byReligion);

    // bahrainisation
    const bahrainis = activeEmployees.filter(e =>
  e.Nation && e.Nation.toLowerCase().includes('bahrain')
).length;

const nonBahrainis = activeEmployees.length - bahrainis;

this.bahrainisationData = [
  { name: 'Bahraini', value: bahrainis },
  { name: 'Non-Bahraini', value: nonBahrainis }
];

// Optional: percentage
this.bahrainisationPercent =
  activeEmployees.length
    ? ((bahrainis / activeEmployees.length) * 100).toFixed(1)
    : '0';

  
    // 2️⃣ Average Tenure (years since join date)
    const now = new Date();  
    const tenures = activeEmployees
    .filter(e => e.joindt).map(e => (now.getTime() - new Date(e.joindt)
    .getTime()) / (1000 * 60 * 60 * 24 * 365));
    this.avgTenure = tenures.length ? (tenures.reduce((a, b) => a + b, 0) / tenures.length).toFixed(1) : '0';

    // 3️⃣ Average Age
    const ages = activeEmployees
    .filter(e => e.dateofbirth)
    .map(e => (now.getTime() - new Date(e.dateofbirth).getTime()) / (1000 * 60 * 60 * 24 * 365));

    this.avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : '0';

    // 5️⃣ Join Date Trend (new hires per month/year)
const hiresByYear = this.groupByDate(activeEmployees, 'joindt', 'year');
this.joinTrendData = [
  {
    name: 'New Hires',
    series: this.formatGroup(hiresByYear)
  }
];
  // 6️⃣ Attrition Trend (inactive employees per month)
  const inactiveEmployees = this.empList.filter(e => e.Active === false);
  const attritionByYear = this.groupByDate(inactiveEmployees, 'discontinuedDt', 'year');

this.attritionTrendData = [
  {
    name: 'Attrition',
    series: this.formatGroup(attritionByYear)
  }
];

this.joinAttritionTrendData = [
  {
    name: 'New Hires',
    series: this.formatGroup(hiresByYear)
  },
  {
    name: 'Attrition',
    series: this.formatGroup(attritionByYear)
  }
];



  // 7️⃣ Average Tenure by Department
  const tenureByDept: any = {};
  activeEmployees.forEach(e => {
    const dept = e.deptds || 'Unknown';
    const tenure = e.joindt ? (now.getTime() - new Date(e.joindt).getTime()) / (1000 * 60 * 60 * 24 * 365) : 0;
    if (!tenureByDept[dept]) tenureByDept[dept] = [];
    tenureByDept[dept].push(tenure);
  });
  this.avgTenureByDept = Object.entries(tenureByDept).map(([dept, list]: any) => ({
    name: dept,
    value: +(list.reduce((a: number, b: number) => a + b, 0) / list.length).toFixed(1)
  }));

  // 8️⃣ Age Distribution (histogram buckets)
  // 1️⃣ Calculate ages of active employees

// 2️⃣ Create 1-year bins
const bins: Record<number, number> = {};
ages.forEach(age => {
  const key = Math.floor(age);   // 1-year bucket
  bins[key] = (bins[key] || 0) + 1;
});

// 3️⃣ Convert bins into ngx-charts series
this.ageDistributionData = [
  {
    name: 'Employees',
    series: Object.entries(bins)
      .map(([age, count]) => ({
        name: age,           // X-axis: age
        value: count         // Y-axis: number of employees
      }))
      .sort((a, b) => +a.name - +b.name)  // Ensure ascending order
  }
];


// Add curve for smooth line
this.ageDistributionCurve = shape.curveBasis; // or curveMonotoneX

// 1️⃣ Filter active employees with valid DOB and Designation level
const ageDesignationPoints = activeEmployees
  .filter(e => e.dateofbirth && e.DesignationLevelNumeric != null)
  .map(e => {
    const age = (today.getTime() - new Date(e.dateofbirth).getTime()) / (1000 * 60 * 60 * 24 * 365);
    return { 
      name: e.designationDs, 
      x: +age.toFixed(1),          // age in years
      y: e.DesignationLevelNumeric // numeric designation
    };
  });

// 2️⃣ Group by Designation
const groupedByDesignation: Record<string, { x: number; y: number }[]> = {};
ageDesignationPoints.forEach(p => {
  if (!groupedByDesignation[p.name]) groupedByDesignation[p.name] = [];
  groupedByDesignation[p.name].push({ x: p.x, y: p.y });
});

// 3️⃣ Convert to ngx-charts-bubble-chart format
this.ageVsDesignationData = {
  series: Object.entries(groupedByDesignation).map(([name, points]) => ({
    name,
    data: points.map(pt => [pt.x, pt.y])
  }))
};

const upcomingDays = 30;
const today = new Date();
today.setHours(0, 0, 0, 0);

this.upcomingBirthdays.data = activeEmployees
  .filter(e => e.dateofbirth)
  .map(e => {
    const dob = new Date(e.dateofbirth);

    // Birthday in current year
    const nextBirthday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());

    // If already passed, move to next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }

    return {
      ...e,
      _nextBirthday: nextBirthday
    };
  })
  .filter(e => {
    const diffDays =
      (e._nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 30;
  })
  .sort((a, b) =>
    a._nextBirthday.getTime() - b._nextBirthday.getTime()
  );

if (this.birthdayPaginator) {
  this.birthdayPaginator.pageIndex = 0;
  this.updatePagedBirthdays();
} else {
  this.pagedBirthdays = this.upcomingBirthdays.data.slice(0, 5);
}

this.upcomingAnniversaries.data = activeEmployees
  .filter(e => e.joindt)
  .filter(e => {
    const anniv = new Date(e.joindt);
    anniv.setFullYear(today.getFullYear());
    const diffDays = (anniv.getTime() - today.getTime()) / (1000*60*60*24);
    return diffDays >= 0 && diffDays <= upcomingDays;
  })
  .map(e => {
    const years = e.joindt ? Math.floor((today.getTime() - new Date(e.joindt).getTime()) / (1000*60*60*24*365)) : 0;
    return { ...e, years };
  })
  .sort((a,b) => new Date(a.joindt).getTime() - new Date(b.joindt).getTime());

if (this.anniversaryPaginator) {
  this.anniversaryPaginator.pageIndex = 0;
  this.updatePagedAnniversaries();
} else {
  this.pagesAnniversaries = this.upcomingAnniversaries.data.slice(0, 5);
}


  // 9️⃣ Nationality Mix %
  const totalNationals = this.nationalityData.reduce((sum, n) => sum + n.value, 0);
  this.nationalityMixPercent = this.nationalityData.map(n => ({
    ...n,
    percent: ((n.value / totalNationals) * 100).toFixed(1)
  }));

  // 🔟 Departmental Metrics
  const deptArray = this.departmentData;
  this.maxDept = deptArray.reduce((a, b) => (a.value > b.value ? a : b), { name: 'N/A', value: 0 });
  this.minDept = deptArray.reduce((a, b) => (a.value < b.value ? a : b), { name: 'N/A', value: 9999 });

  this.deptOldest = this.avgTenureByDept.reduce((a, b) => (a.value > b.value ? a : b), { name: 'N/A', value: 0 });
  this.deptYoungest = Object.entries(byDept).map(([dept]) => {
    const ages = activeEmployees.filter(e => e.deptds === dept && e.dateofbirth)
      .map(e => (now.getTime() - new Date(e.dateofbirth).getTime()) / (1000 * 60 * 60 * 24 * 365));
    return { name: dept, value: ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : 0 };
  }).reduce((a, b) => (+a.value < +b.value ? a : b), { name: 'N/A', value: 999 });





 
  this.setChartSize();
  this.cdr.detectChanges();
  }

  updatePagedBirthdays() {
  const startIndex = this.birthdayPaginator.pageIndex * this.birthdayPaginator.pageSize;
  const endIndex = startIndex + this.birthdayPaginator.pageSize;
  this.pagedBirthdays = this.upcomingBirthdays.data.slice(startIndex, endIndex);
}

  updatePagedAnniversaries() {
  const startIndex = this.anniversaryPaginator.pageIndex * this.anniversaryPaginator.pageSize;
  const endIndex = startIndex + this.anniversaryPaginator.pageSize;
  this.pagesAnniversaries = this.upcomingAnniversaries.data.slice(startIndex, endIndex);
}

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



// Helper: group by date (month/year)
groupByDate(array: any[], key: string, mode: 'month' | 'year') {
  const grouped: any = {};
  array.forEach(e => {
    const dateVal = e[key];
    if (!dateVal) return;
    const date = new Date(dateVal);
    const label =
      mode === 'month'
        ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
        : `${date.getFullYear()}`;
    grouped[label] = (grouped[label] || 0) + 1;
  });
  return grouped;
}


setChartSize() {
  this.chartWidth = Math.floor(window.innerWidth * 1);
  this.chartHeight = Math.floor(window.innerHeight * 0.4);
}

private bufferToBase64(imageStream: any): string {
  if (!imageStream || !imageStream.data || imageStream.data.length === 0) {
    return this.defaultAvatar; // ← never return null
  }

  const binary = new Uint8Array(imageStream.data);
  let binaryString = '';
  binary.forEach(b => binaryString += String.fromCharCode(b));

  return 'data:image/bmp;base64,' + btoa(binaryString);
}

private defaultAvatar =
'data:image/svg+xml;utf8,' +
encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80">
  <rect width="100%" height="100%" fill="#e0e0e0"/>
  <circle cx="40" cy="30" r="14" fill="#9e9e9e"/>
  <rect x="18" y="46" width="44" height="20" rx="10" fill="#9e9e9e"/>
</svg>
`);

/*@HostListener('window:resize', ['$event'])
onResize() {
  this.setChartSize();
}*/
}