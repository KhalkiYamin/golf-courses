import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachSessionsComponent } from './coach-sessions.component';

describe('CoachSessionsComponent', () => {
    let component: CoachSessionsComponent;
    let fixture: ComponentFixture<CoachSessionsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachSessionsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachSessionsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
