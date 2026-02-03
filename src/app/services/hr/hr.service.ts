import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HrService {
 private url = 'https://ifayacapi.theworkpc.com/api';

  constructor(private http:HttpClient) { }

  getallemployee() {
    return this.http.get(this.url + '/hr/getallemployee')
  }    

  getEmpAttReport(empCode: string, month: string, year: string) {
    return this.http.get(this.url + '/reports/empYacAttReport/' + empCode +'/' + year + '/' + month)
  }      

  getEmpWageSheet(punchLinkId: string) {
    return this.http.get(this.url + '/reports/empwagespunchlinkid/' + punchLinkId)
  }

  postWageAllocation(PunchLinkid: string, year: string, month: string, day:string, nor:string, NOTT: string,HOTT: string,SOTT:string,BREAK: string, empid: string, premisesid: string, job_no: string, sono: string, contractorid: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    const newTran = {
      PunchLinkid: PunchLinkid,
      year: year, 
      month: month,
      day: day,
      nor: nor,
      NOTT: NOTT,
      HOTT: HOTT,
      SOTT:SOTT,
      mBREAK: BREAK, 
      empid: empid,
      premisesid: premisesid,
      job_no: job_no,
      sono: sono,
      contractorid: contractorid
    }
    return this.http.post(this.url + '/reports/DeleteInsertWagesAllocation', JSON.stringify(newTran), { headers: headers })
  }
}