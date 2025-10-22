import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceCallsComponent } from './service-calls.component';

describe('ServiceCallsComponent', () => {
  let component: ServiceCallsComponent;
  let fixture: ComponentFixture<ServiceCallsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ServiceCallsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ServiceCallsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
