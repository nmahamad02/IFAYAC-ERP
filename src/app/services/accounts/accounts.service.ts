import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {

  private url1 = 'http://20.203.120.150:5000/api';
  private url2 = 'https://api.ifagate-petzone.theworkpc.com/api'

  constructor(private http:HttpClient) { }

  listOpbal(type: string) {
    //return this.http.get(this.url2 + '/opbal/list/' + year + '/' + type)
    return this.http.get(this.url1 + '/listbp/' + type)
  }    

  getOpbal(pcode: string) {
    //return this.http.get(this.url2 + '/opbal/get/' + year + '/' + pcode)
    return this.http.get(this.url1 + '/getbp/' + pcode)
  } 

  searchOpbal(search: string, type: string) {
    //return this.http.get(this.url2 + '/opbal/search/' + year + '/' + search + '/' + type)
    return this.http.get(this.url1 + '/searchbp/' + type + '/' + search)
  } 

  getTitle() {
    return this.http.get(this.url2 + '/opbal/gettitle')
  } 

  postOpbal(pcode: string, title: string, name: string, type: string, add1: string, add2: string, add3: string, phone1: string, phone2: string, email: string,mobile: string, glcode: string,status: string, remarks: string, taxno: string, branch: string, accType: string, accCategory: string,crcpr: string,year: string,opbal:number) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    const newTran = {
      pcode: pcode,
      title: title, 
      name: name,
      type: type,
      add1: add1,
      add2: add2,
      add3: add3,
      phone1: phone1,
      phone2: phone2, 
      email: email,
      mobile: mobile,
      glcode: glcode,
      status: status,
      remarks: remarks,
      taxno: taxno,
      branch: branch,
      accType: accType,
      accCategory: accCategory,
      crcpr: crcpr,
      year: year,
      opbal: opbal
    }
    return this.http.post(this.url2 + '/opbal/newRecord', JSON.stringify(newTran), { headers: headers })
  }

  updateOpbal(pcode: string, title: string, name: string, type: string, add1: string, add2: string, add3: string, phone1: string, phone2: string, email: string,mobile: string, glcode: string,status: string, remarks: string, taxno: string, branch: string, accType: string, accCategory: string,crcpr: string,year: string,opbal:number) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    const newTran = {
      pcode: pcode,
      title: title, 
      name: name,
      type: type,
      add1: add1,
      add2: add2,
      add3: add3,
      phone1: phone1,
      phone2: phone2, 
      email: email,
      mobile: mobile,
      glcode: glcode,
      status: status,
      remarks: remarks,
      taxno: taxno,
      branch: branch,
      accType: accType,
      accCategory: accCategory,
      crcpr: crcpr,
      year: year,
      opbal: opbal
    }
    return this.http.post(this.url2 + '/opbal/updateRecord', JSON.stringify(newTran), { headers: headers })
  }

  getParty(pcode: string) {
    return this.http.get(this.url2 + '/opbal/getParty/' + pcode)
  } 

  deleteParty(partyId: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    const newTran = {
      partyId: partyId
    }
    return this.http.post(this.url2 + '/opbal/deleteParty', JSON.stringify(newTran), { headers: headers })
  } 

  getPartyIdMax() {
    return this.http.get(this.url2 + '/opbal/getPartyIdMax')
  } 

  getBranch() {
    return this.http.get(this.url2 + '/opbal/getBranch')
  } 

  getCustomerAccountType() {
    return this.http.get(this.url2 + '/opbal/getCustomerAccountType')
  } 

  getAccountCategory() {
    return this.http.get(this.url2 + '/opbal/getAccountCategory')
  }

  addNewParty(pcode: string, partyid: string, name: string, type: string, add1: string, add2: string, add3: string, phone1: string, phone2: string, email: string,mobile: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    const newTran = {
      pcode: pcode,
      partyid: partyid, 
      name: name,
      type: type,
      add1: add1,
      add2: add2,
      add3: add3,
      phone1: phone1,
      phone2: phone2, 
      email: email,
      mobile: mobile
    }
    return this.http.post(this.url2 + '/opbal/addNewParty', JSON.stringify(newTran), { headers: headers })
  }

  updatePartyDetails(pcode: string, partyid: string, name: string, type: string, add1: string, add2: string, add3: string, phone1: string, phone2: string, email: string,mobile: string) {
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
  
    const newTran = {
      pcode: pcode,
      partyid: partyid, 
      name: name,
      type: type,
      add1: add1,
      add2: add2,
      add3: add3,
      phone1: phone1,
      phone2: phone2, 
      email: email,
      mobile: mobile
    }
    return this.http.post(this.url2 + '/opbal/updatePartyDetails', JSON.stringify(newTran), { headers: headers })
  }

  
}