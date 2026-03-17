import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachAthletesComponent } from './coach-athletes.component';

describe('CoachAthletesComponent', () => {
    let component: CoachAthletesComponent;
    let fixture: ComponentFixture<CoachAthletesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachAthletesComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachAthletesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
