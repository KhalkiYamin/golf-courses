import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RessourcesSportivesComponent } from './ressources-sportives.component';

describe('RessourcesSportivesComponent', () => {
  let component: RessourcesSportivesComponent;
  let fixture: ComponentFixture<RessourcesSportivesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RessourcesSportivesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RessourcesSportivesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
