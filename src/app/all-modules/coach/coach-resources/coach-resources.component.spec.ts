import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoachResourcesComponent } from './coach-resources.component';

describe('CoachResourcesComponent', () => {
    let component: CoachResourcesComponent;
    let fixture: ComponentFixture<CoachResourcesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachResourcesComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachResourcesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
