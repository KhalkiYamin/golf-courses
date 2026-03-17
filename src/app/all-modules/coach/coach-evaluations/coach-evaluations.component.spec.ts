import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachEvaluationsComponent } from './coach-evaluations.component';

describe('CoachEvaluationsComponent', () => {
    let component: CoachEvaluationsComponent;
    let fixture: ComponentFixture<CoachEvaluationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachEvaluationsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachEvaluationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
