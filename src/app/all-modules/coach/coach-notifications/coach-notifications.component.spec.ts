import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachNotificationsComponent } from './coach-notifications.component';

describe('CoachNotificationsComponent', () => {
    let component: CoachNotificationsComponent;
    let fixture: ComponentFixture<CoachNotificationsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachNotificationsComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachNotificationsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
