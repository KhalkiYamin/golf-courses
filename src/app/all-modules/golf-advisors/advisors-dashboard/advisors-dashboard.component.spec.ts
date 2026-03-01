import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvisorsDashboardComponent } from './advisors-dashboard.component';

describe('AdvisorsDashboardComponent', () => {
  let component: AdvisorsDashboardComponent;
  let fixture: ComponentFixture<AdvisorsDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AdvisorsDashboardComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvisorsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
