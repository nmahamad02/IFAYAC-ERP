import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { AccountsService } from 'src/app/services/accounts/accounts.service';
import { DataSharingService } from 'src/app/services/data-sharing/data-sharing.service';
import { FinanceService } from 'src/app/services/finance/finance.service';
import { ReportsService } from 'src/app/services/reports/reports.service';
import { map, startWith } from 'rxjs/operators';
import { of } from 'rxjs';
import { HrService } from 'src/app/services/hr/hr.service';
import { hourMinuteValidator } from 'src/app/validators/hour-minute.validator';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-wages',
  templateUrl: './wages.component.html',
  styleUrls: ['./wages.component.scss']
})
export class WagesComponent {

  @ViewChild('josSearchLookupDialogue', { static: false }) josSearchLookupDialogue!: TemplateRef<any>;

  currentYear = new Date().getFullYear()
  mCurDate = this.formatDate(new Date())

  startDate: Date;

  selectedIndex: number | null = null;


  empList: any[] = []
 jobList : any[] = []
 soList : any[] = []
  filteredEmployees$: Observable<any[]>;

  activeBreakdownIndex: number | null = null;
  activeField: 'jobNo' | 'soNo' | null = null;

  attendanceForm = new FormGroup({
  records: new FormArray([])
});


selectedJobIndex = 0;
  
  employeeCtrl = new FormControl('');
  employeeName = new FormControl('');

  public custForm: FormGroup;

  constructor(private hrService: HrService, private route: ActivatedRoute, private dialog: MatDialog, private router: Router, private accountService: AccountsService, private reportService: ReportsService, private dataSharingService: DataSharingService,     private cd: ChangeDetectorRef
) { 

    }

ngOnInit() {
  this.hrService.getallemployee().subscribe((res: any) => {
    console.log(res)
    this.empList = res.recordset;

    this.filteredEmployees$ = this.employeeCtrl.valueChanges.pipe(
      startWith(''),
      map((value:any) => this._filterEmployees(value))
    );
  });
  this.reportService.getAllJobsO().subscribe((res: any) => {
    console.log(res)
    this.jobList = res.recordset;
  })
}



private _filterEmployees(value: string): any[] {
  const filterValue = (value ?? '').toString().toLowerCase();

  return this.empList.filter(emp =>
    emp.empcd?.toString().toLowerCase().includes(filterValue) ||
    emp.empname?.toLowerCase().includes(filterValue)
  );
}

onEmployeeInput(value: string) {
  this.filteredEmployees$ = of(this._filterEmployees(value));
}

onEmployeeSelected(event: any) {
  const empcd = event.option.value;

  const selectedEmp = this.empList.find(
    emp => emp.empcd === empcd
  );

  if (selectedEmp) {
    this.employeeName.setValue(selectedEmp.empname);
  }
}

onFilter() {
  if (!this.employeeCtrl.value || !this.startDate) {
    alert('Please select employee and month');
    return;
  }

  const empCode = this.employeeCtrl.value;

  const [year, month] = this.startDate.toString().split('-');

  this.hrService
    .getEmpAttReport(empCode, month, year)
    .subscribe((res: any) => {
      this.buildAttendanceForm(res.recordset);
      console.log(res.recordset)
    });
}

buildAttendanceForm(data: any[]) {
  this.records.clear();

  data.forEach(row => {
    this.records.push(
      new FormGroup({
        punchLinkId: new FormControl(row.ROTAID),
        date: new FormControl(row.AttendanceDate),
        day: new FormControl(row.DayOfWeek),
        checkin: new FormControl(row.CheckinTime),
        checkout: new FormControl(row.CheckoutTime),
        hours: new FormControl(row.TotalHoursWorked),
        status: new FormControl(row.AttendanceStatus),
        project: new FormControl(row.PROJECTID),
        sono: new FormControl(row.SONO),

        wageBreakdown: new FormArray([])   
      })
    );
  });
}

getBreakDown(index: number) {
  this.selectedIndex = index;

  const recordGroup = this.records.at(index) as FormGroup;
  const punchLinkId = recordGroup.get('punchLinkId')?.value;

  if (!punchLinkId) return;

  // Load only once
  if (this.getWageBreakdown(index).length) return;

  this.hrService.getEmpWageSheet(punchLinkId)
    .subscribe((res: any) => {
      this.buildWageBreakdown(index, res.recordset);
    });
}

buildWageBreakdown(index: number, data: any[]) {
  const breakdownArray = this.getWageBreakdown(index);
  breakdownArray.clear();

  data.forEach(row => {

    const nor = new FormControl(row.NOR, [hourMinuteValidator]);
    const nott = new FormControl(row.NOTT, [hourMinuteValidator]);
    const hott = new FormControl(row.HOTT, [hourMinuteValidator]);
    const sott = new FormControl(row.SOTT, [hourMinuteValidator]);
    const breakT = new FormControl(row.mBREAK, [hourMinuteValidator]);

    // 🔔 Wire the alert
    this.attachMinuteAlert(nor);
    this.attachMinuteAlert(nott);
    this.attachMinuteAlert(hott);
    this.attachMinuteAlert(sott);
    this.attachMinuteAlert(breakT);

    breakdownArray.push(
      new FormGroup({
        nor,
        nott,
        hott,
        sott,
        breakT,
        jobNo: new FormControl(row.JOB_NO),
        soNo: new FormControl(row.SO_NO),
        contractor: new FormControl(row.CONTRACTORID),
        premises: new FormControl(row.PREMISESID)
      })
    );
  });
}

addBreakdown(index: number) {
  const breakdownArray = this.getWageBreakdown(index);

  const nor = new FormControl(0, [hourMinuteValidator]);
  const nott = new FormControl(0, [hourMinuteValidator]);
  const hott = new FormControl(0, [hourMinuteValidator]);
  const sott = new FormControl(0, [hourMinuteValidator]);
  const breakT = new FormControl(0, [hourMinuteValidator]);

  this.attachMinuteAlert(nor);
  this.attachMinuteAlert(nott);
  this.attachMinuteAlert(hott);
  this.attachMinuteAlert(sott);
  this.attachMinuteAlert(breakT);

  breakdownArray.push(
    new FormGroup({
      nor,
      nott,
      hott,
      sott,
      breakT,
      jobNo: new FormControl(null),
      soNo: new FormControl(null),
      contractor: new FormControl(null),
      premises: new FormControl(null)
    })
  );
}


submitBreakdown(index: number) {
  const record = this.records.at(index);
  const breakdowns = record.get('wageBreakdown') as FormArray;

  const totalAllocatedMinutes = breakdowns.controls.reduce((sum, ctrl) => {
    const v = ctrl.value;
    return (
      sum + Number(v.nor || 0) + Number(v.nott || 0) + Number(v.hott || 0) + Number(v.sott || 0) + Number(v.breakT || 0)
    );
  }, 0);

  const hoursWorked = Number(record.get('hours')?.value || 0);

  if (totalAllocatedMinutes > hoursWorked) {
    alert(`Allocated hours cannot exceed hours worked (${this.decimalToTime(hoursWorked)}).`);
    return;
  }

  // ✅ Prepare payload

  var month = new Date(record.get('date')?.value).getMonth()+1

  for (let i=0; i<breakdowns.value.length;i++){
    console.log(breakdowns.value[i])
    this.hrService.postWageAllocation(
      record.get('punchLinkId')?.value,
      new Date(record.get('date')?.value).getFullYear().toString(),
      month.toString(),
      new Date(record.get('date')?.value).getDate().toString(),
      breakdowns.value[i].nor,
      breakdowns.value[i].nott,
      breakdowns.value[i].hott,
      breakdowns.value[i].sott,
      breakdowns.value[i].breakT,
      this.employeeCtrl.value!,
      breakdowns.value[i].premises,
      breakdowns.value[i].jobNo,
      breakdowns.value[i].soNo,
      breakdowns.value[i].contractor
    ).subscribe({
    next: (res) => {
      alert('Wage allocation submitted successfully!');
      console.log(res);
    },
    error: (err) => {
      if (err.status === 200){
        alert('Wage allocation submitted successfully!');
      } else {
        alert('Error submitting wage allocation');
        console.error(err);
      }
    }
  });
  }

}



  formatDate(date: any) {
    var d = new Date(date), day = '' + d.getDate(), month = '' + (d.getMonth() + 1), year = d.getFullYear();

    if (day.length < 2) {
      day = '0' + day;
    } 
    if (month.length < 2) {
      month = '0' + month;
    }
    return [day, month, year].join('-');
  }
get records(): FormArray {
  return this.attendanceForm.get('records') as FormArray;
}

getWageBreakdown(i: number): FormArray {
  return this.records.at(i).get('wageBreakdown') as FormArray;
}

getRecordGroup(index: number): FormGroup {
  return this.records.at(index) as FormGroup;
}

attachMinuteAlert(control: FormControl) {
  control.valueChanges.subscribe(() => {
    if (control.hasError('invalidMinutes')) {
      alert('Invalid input: minutes must be less than 60');
    }
  });
}

decimalToTime(value: number): string {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  return `${hours}.${minutes}`;
}

toMinutes(value: number): number {
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 100);
  return hours * 60 + minutes;
}

fromMinutes(totalMinutes: number): number {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return Number(`${hours}.${minutes.toString().padStart(2, '0')}`);
}


openJobLookup(breakdownIndex: number) {
  this.activeBreakdownIndex = breakdownIndex;

  this.dialog.open(this.josSearchLookupDialogue, {
    width: '100vw',
    maxWidth: '100vw',
    autoFocus: true
  });
}


searchJob(search: string) {
  this.reportService.gettop15jobs(search).subscribe((res: any)=> {
    console.log(res)
    this.jobList = res;
  })
}

selectJob(row: any){
  console.log(row)
    this.reportService.getTop15so(row.PrjCode).subscribe((res: any)=> {
      console.log(res)
      this.soList = res;
    })
}

selectSo(row: any) {
  if (
    this.selectedIndex === null ||
    this.activeBreakdownIndex === null
  ) {
    return;
  }

  const breakdownArray = this.getWageBreakdown(this.selectedIndex);
  const breakdownGroup = breakdownArray.at(this.activeBreakdownIndex) as FormGroup;

  breakdownGroup.patchValue({
    jobNo: row.Project,
    soNo: row["Series-DocNum"]
  });

  this.dialog.closeAll();

  this.dialog.afterAllClosed.subscribe(() => {
  this.activeBreakdownIndex = null;
});

}


printReport(): void {
  const link = document.createElement('a');
  link.href = 'assets/reports/WAGES-2026.xlsx';
  link.click();
}

}
