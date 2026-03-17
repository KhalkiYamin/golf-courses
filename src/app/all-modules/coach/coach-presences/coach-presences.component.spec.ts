import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachPresencesComponent } from './coach-presences.component';

describe('CoachPresencesComponent', () => {
    let component: CoachPresencesComponent;
    let fixture: ComponentFixture<CoachPresencesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachPresencesComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachPresencesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
