import { Component, OnInit } from '@angular/core';
import { HrService } from 'src/app/services/hr/hr.service';
import { ReportsService } from 'src/app/services/reports/reports.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-payslips',
  templateUrl: './payslips.component.html',
  styleUrls: ['./payslips.component.scss']
})
export class PayslipsComponent implements OnInit {

  employeeList: any[] = [];
  searchText = '';

  selectedEmployee: any = null;
  payslipList: any[] = [];
selectedPayslips: any[] = [];

  loadingEmployees = true;
  loadingPayslips = false;

  constructor(
    private hrService: HrService,
    private reportService: ReportsService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  /** Load the full employee master list */
loadEmployees() {
  this.hrService.getallemployee().subscribe((res: any) => {
    const list = res.recordset || [];

    // ✅ Filter ACTIVE employees only – same logic as Demography
    this.employeeList = list.filter((e: any) => {
      const status =
        e.EmpStatus ??
        e.STATUS ??
        e.ActiveStatus ??
        e.IsActive ??
        e.active ??
        '';

      // Normalize to lowercase string for safe comparison
      const val = status.toString().trim().toLowerCase();

      return val === 'active' || val === 'yes' || val === '1' || val === 'true';
    });

    this.loadingEmployees = false;
  });
}

  /** When a user clicks 'View Payslips' */
  selectEmployee(emp: any) {
    this.selectedEmployee = emp;
    this.getPayslips(emp.empid);
  }

  /** Load selected employee payslips */
getPayslips(id: number) {
  this.loadingPayslips = true;
  this.payslipList = [];

  this.reportService.getMyPayslip(id.toString()).subscribe((res: any) => {
    const list = res.recordset || [];

    // ✅ Sort newest → oldest by PayMonth
    this.payslipList = list.sort((a: any, b: any) =>
      new Date(b.PayMonth).getTime() - new Date(a.PayMonth).getTime()
    );

    this.loadingPayslips = false;
  });
}

togglePayslip(p: any) {
  const exists = this.selectedPayslips.find(x => x.PayrollID === p.PayrollID);

  if (exists) {
    this.selectedPayslips = this.selectedPayslips.filter(
      x => x.PayrollID !== p.PayrollID
    );
  } else {
    this.selectedPayslips.push(p);
  }
}

isSelected(p: any) {
  return this.selectedPayslips.some(x => x.PayrollID === p.PayrollID);
}

  /** Print entire page */
  printPage() {
    window.print();
  }
printSelectedPayslips() {
  if (this.selectedPayslips.length === 0) return;

  const doc = new jsPDF("portrait", "px", "a4");

  this.selectedPayslips.forEach((p, index) => {

    if (index > 0) doc.addPage();

    // ✅ Add logo on top
    const img = new Image();
    img.src = 'assets/pics/304845661_426993469498497_2513691865577121575_n-2.png';
    doc.addImage(img, 'png', 125, -10, 200, 72);

    // Header Text
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Employee Payslip', 165, 62.5);

    // Employee Info Box
    doc.roundedRect(30, 70, 387.5, 45, 3, 3);
    doc.setFontSize(10);
    doc.text(`Employee: ${this.selectedEmployee.empname}`, 35, 80);
    doc.text(`Designation: ${this.selectedEmployee.designationDs}`, 35, 90);
    doc.text(`Department: ${this.selectedEmployee.deptds}`, 35, 100);
    doc.text(
      `Month: ${new Date(p.PayMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      35,
      110
    );

    // ✅ Earnings Table
    autoTable(doc, {
      startY: 120,
      head: [['Earnings', 'Amount']],
      body: [
        ['Basic Salary', Number(p.BasicSalary).toFixed(3)],
        ['Fixed Allowances', Number(p.TotalFixAllow).toFixed(3)],
        ['Variable Allowances', Number(p.TotalVarAlow).toFixed(3)],
        ['Gross Salary', Number(p.GrossSalary).toFixed(3)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [40, 22, 111],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'right' }  // ✅ Right align amounts
      }
    });

    const lastY1 = (doc as any).lastAutoTable?.finalY ?? 140;

    // ✅ Deductions Table
    autoTable(doc, {
      startY: lastY1 + 5,
      head: [['Deductions', 'Amount']],
      body: [
        ['Fixed Deductions', Number(p.TotalFixDed).toFixed(3)],
        ['Variable Deductions', Number(p.TotalVarDed).toFixed(3)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [40, 22, 111],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: { fontSize: 9 },
      columnStyles: {
        1: { halign: 'right' }  // ✅ Right align amounts
      }
    });

    const lastY2 = (doc as any).lastAutoTable?.finalY ?? lastY1 + 40;

    // ✅ Net Salary (right aligned)
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text(`Net Salary: ${Number(p.NetSalary).toFixed(3)}`, 325, lastY2 + 15);

    // Page Number (unchanged)
    doc.setFontSize(8);
    doc.text(`Page ${index + 1} of ${this.selectedPayslips.length}`, 380, 620);
  });

  const filename =
    `${this.selectedEmployee.empname}-payslips-${new Date().toLocaleDateString()}.pdf`;

  doc.save(filename);
}

}