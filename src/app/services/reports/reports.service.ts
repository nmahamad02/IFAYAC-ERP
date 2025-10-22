import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private url1 = 'https://ifayacapi.theworkpc.com/api';
  private url2 = 'https://api.ifagate-petzone.theworkpc.com/api'

  constructor(private http:HttpClient) { }

  getBusinessCount(type: string) {
    return this.http.get(this.url2 + '/report/get-business-count/' + type)
  }    
  
  getCustomerCount() {
    return this.http.get(this.url2 + '/report/get-customer-count')
  }  

  getBusinessList(type: string) {
    return this.http.get(this.url1 + '/hana/listbp/' + type)
  }

  getallemp() {
    return this.http.get(this.url1 + '/hr/getallemp')
  }    
  
  getallorders() {
    return this.http.get(this.url1 + '/hana/getallorders')
  }   
  
  getproductcount() {
    return this.http.get(this.url1 + '/hana/getProductCount')
  } 

  getCustomerList(type: string) {
    return this.http.get(this.url1 + '/hana/listbp/' + type)
  }    
  
  getpj(prjcode: string) {
    return this.http.get(this.url1 + '/hana/getpj/' + prjcode)
  }    
  
  listJobStatus() {
    return this.http.get(this.url1 + '/hana/listJobStatus')
  }   
  
  getJobStatus(prjcode: string) {
    return this.http.get(this.url1 + '/hana/getJobStatus/' + prjcode)
  }    
  
  listAllJobs() {
    return this.http.get(this.url1 + '/hana/listAllJobs')
  }    
  
  listAllBusinessCenters() {
    return this.http.get(this.url1 + '/hana/listAllBusinessCenters')
  }    
  
  listAllBusinessCentreWiseJobs(busiCent: string) {
    return this.http.get(this.url1 + '/hana/listAllBusinessCentreWiseJobs/' + busiCent)
  }    
  
  listAllYearwiseBusinessCentreWiseJobs(busiCent: string, year: string) {
    return this.http.get(this.url1 + '/hana/listAllYearwiseBusinessCentreWiseJobs/' + busiCent + '/' + year)
  }    
  
  searchAllJobs(busiCent: string, year: string, search: string) {
    return this.http.get(this.url1 + '/hana/searchAllJobs/'  + busiCent + '/' + year + '/' + search)
  }  

  getAllJobs(busiCent: string, year: string, prjcode: string) {
    return this.http.get(this.url1 + '/hana/getAllJobs/'  + busiCent + '/' + year + '/' + prjcode)
  }  



  
  getProductList() {
    return this.http.get(this.url2 + '/report/get-product-list')
  } 
  
  getLocationList() {
    return this.http.get(this.url2 + '/report/get-location-list')
  }

  getYearwiseCountrywiseList() {
    return this.http.get(this.url2 + '/report/get-yearwise-countrywise-list')
  }

  getMonthwiseSalesdata(country: string) {
    return this.http.get(this.url2 + '/report/get-monthwise-salesdata/' + country)
  }

  getCustomerSoa(type: string,pcode: string) {
   // return this.http.get(this.url2 + '/report/get-customer-soa/' + type + '/' + pcode)
    return this.http.get(this.url1 + '/hana/getcuststmt/' + pcode)
  }

  getParentSoa(parentcode: string) {
    return this.http.get(this.url2 + '/report/get-parent-soa/' + parentcode)
  }

  getCustomerOpenSoa(type: string,pcode: string) {
    return this.http.get(this.url2 + '/report/get-customer-open-soa/' + type + '/' + pcode)
  }

  getParentOpenSoa(parentcode: string) {
    return this.http.get(this.url2 + '/report/get-parent-open-soa/' + parentcode)
  }

  getIndustry() {
    return this.http.get(this.url2 + '/report/get-industry')
  }

  getOrganisation() {
    return this.http.get(this.url2 + '/report/get-organisation')
  }

  getParent() {
    return this.http.get(this.url2 + '/report/get-parent')
  }

  getParentFromOrg(org: string) {
    return this.http.get(this.url2 + '/report/get-parent-from-organisation/' + org)
  }

  getCategory() {
    return this.http.get(this.url2 + '/report/get-category')
  }

  getSubcategory() {
    return this.http.get(this.url2 + '/report/get-subcategory')
  }

  getCountry() {
    return this.http.get(this.url2 + '/report/get-country')
  }

  getLocation() {
    return this.http.get(this.url2 + '/report/get-location')
  }

  searchCustomer(search: string) {
    return this.http.get(this.url2 + '/report/search-customer/' + search)
  }

  getMonthlySales() {
    return this.http.get(this.url2 + '/report/get-monthly-sales')
  }

  getMonthwiseSalesSummary() {
    return this.http.get(this.url2 + '/report/get-monthwise-sales-summary')
  }

  getLocationwiseMonthlySales(loc: string) {
    return this.http.get(this.url2 + '/report/get-locationwise-monthly-sales/' + loc)
  }

  getItemwisePeriodSales(startDate: string, endDate: string, location: string, customer: string) {
    return this.http.get(this.url2 + '/report/get-itemwise-period-sales/'  + startDate + '/' + endDate + '/' + location + '/' + customer)
  }  
  
  getVoucherwisePeriodSales(startDate: string, endDate: string, location: string, customer: string) {
    return this.http.get(this.url2 + '/report/get-voucherwise-period-sales/'  + startDate + '/' + endDate + '/' + location + '/' + customer)
  }

  getFastMovingBrand(period: string) {
    return this.http.get(this.url2 + '/report/get-fast-moving-brand/'  + period)
  }  
  
  getSlowMovingBrand(period: string) {
    return this.http.get(this.url2 + '/report/get-slow-moving-brand/'  + period)
  }  
}