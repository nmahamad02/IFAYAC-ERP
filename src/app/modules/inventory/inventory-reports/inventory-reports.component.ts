import { Component, OnInit } from '@angular/core';
import { ReportsService } from 'src/app/services/reports/reports.service';

@Component({
  selector: 'app-inventory-reports',
  templateUrl: './inventory-reports.component.html',
  styleUrls: ['./inventory-reports.component.scss']
})
export class InventoryReportsComponent implements OnInit {

  inventoryData: any[] = [];

  // KPIs
  kpiCards: any[] = [];

  // Charts
  stockByGroupChart: any[] = [];
  warehouseStockChart: any[] = [];
  categoryStockChart: any[] = [];

  
inventoryAgeingChart: any[] = [
  { name: '0–90 Days', value: 0 },
  { name: '91–180 Days', value: 0 },
  { name: '181–365 Days', value: 0 },
  { name: '> 1 Year', value: 0 }
];


  // Tables
  topStockItems: any[] = [];
  lowStockItems: any[] = [];
  deadStockItems: any[] = [];
  deadStockDays = 180;


  constructor(private reportsService: ReportsService) {}

  ngOnInit() {
    this.loadInventory();
  }

loadInventory() {
  this.reportsService.stocklist().subscribe((res: any) => {
    this.inventoryData = res || [];

    this.buildKPIs();
    this.buildStockByGroup();
    this.buildWarehouseStock();
    this.buildCategoryStock();      // ✅ MISSING
    this.buildTopStockItems();
    this.buildLowStockItems();
    this.buildDeadStock();           // ✅ MISSING
    this.buildInventoryAgeing();     // ✅ MISSING
  });
}

  // ---------------- KPIs ----------------
  buildKPIs() {
    let totalValue = 0;
    let totalQty = 0;
    let belowMin = 0;
    let outOfStock = 0;

    this.inventoryData.forEach(i => {
      const onHand = Number(i.OnHand) || 0;
      const min = Number(i.MinOrder) || 0;
      const value = Number(i.OnHand*i.AvgPrice) || 0;

      totalQty += onHand;
      totalValue += value;

      if (onHand === 0) outOfStock++;
      if (onHand > 0 && onHand < min) belowMin++;
    });

    this.kpiCards = [
      { label: 'Total Stock Value', value: totalValue, color: '#2563EB' },
      { label: 'On‑Hand Quantity', value: totalQty, color: '#10B981' },
      { label: 'Below Min Stock', value: belowMin, color: '#F59E0B' },
      { label: 'Out of Stock Items', value: outOfStock, color: '#EF4444' }
    ];
  }

  // ---------------- Stock by Group ----------------
  buildStockByGroup() {
    const groups: any = {};

    this.inventoryData.forEach(i => {
      const grp = i.ItmsGrpNam || 'Unassigned';
      const value = Number(i.OnHand*i.AvgPrice) || 0;
      groups[grp] = (groups[grp] || 0) + value;
    });

    this.stockByGroupChart = Object.entries(groups).map(
      ([name, value]) => ({ name, value })
    );
  }

  // ---------------- Top 10 by Value ----------------
  buildTopStockItems() {
    this.topStockItems = [...this.inventoryData]
      .map(i => ({
        code: i.ItemCode,
        name: i.ItemName,
        value: Number(i.OnHand*i.AvgPrice) || 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);
  }

  // ---------------- Items Below Min ----------------
  buildLowStockItems() {
    this.lowStockItems = this.inventoryData
      .filter(i => Number(i.OnHand) < Number(i.MinOrder))
      .map(i => ({
        code: i.ItemCode,
        name: i.ItemName,
        onHand: Number(i.OnHand) || 0,
        min: Number(i.MinOrder) || 0
      }))
      .sort((a, b) => a.onHand - b.onHand)
      .slice(0, 10);
  }

  

  buildWarehouseStock() {
    const whs: any = {};

    this.inventoryData.forEach(i => {
      const wh = i.WhsName || 'Unknown';
      const value = Number(i.OnHand*i.AvgPrice) || 0;
      whs[wh] = (whs[wh] || 0) + value;
    });

    this.warehouseStockChart = Object.entries(whs).map(
      ([name, value]) => ({ name, value })
    );
  }

  
buildCategoryStock() {
  const cat: any = {};

  this.inventoryData.forEach(i => {
    const category = i.ItmsGrpNam || 'Uncategorised';
    const value = Number(i.OnHand*i.AvgPrice) || 0;
    cat[category] = (cat[category] || 0) + value;
  });

  this.categoryStockChart = Object.entries(cat).map(
    ([name, value]) => ({ name, value })
  );
}
  
buildDeadStock() {
  const today = new Date();

  this.deadStockItems = this.inventoryData
    .filter(i => {
      if (!i.LastPurDat) return true; // never moved
      const last = new Date(i.LastPurDat);
      const diff = (today.getTime() - last.getTime()) / (1000 * 3600 * 24);
      return diff > this.deadStockDays;
    })
    .map(i => ({
      name: i.ItemName,
      value: Number(i.OnHand*i.AvgPrice) || 0,
      onHand: Number(i.OnHand) || 0
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}


buildInventoryAgeing() {
  // Reset buckets
  this.inventoryAgeingChart = [
    { name: '0–90 Days', value: 0 },
    { name: '91–180 Days', value: 0 },
    { name: '181–365 Days', value: 0 },
    { name: '> 1 Year', value: 0 }
  ];

  const today = new Date();

  this.inventoryData.forEach(i => {
    if (!i.LastPurDat) return;

    const days =
      (today.getTime() - new Date(i.LastPurDat).getTime()) / (1000 * 3600 * 24);
    const val = Number(i.OnHand*i.AvgPrice) || 0;

    if (days <= 90) this.inventoryAgeingChart[0].value += val;
    else if (days <= 180) this.inventoryAgeingChart[1].value += val;
    else if (days <= 365) this.inventoryAgeingChart[2].value += val;
    else this.inventoryAgeingChart[3].value += val;
  });
}


}