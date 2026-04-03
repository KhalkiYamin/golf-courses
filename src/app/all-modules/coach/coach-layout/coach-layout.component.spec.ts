import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { CoachLayoutComponent } from './coach-layout.component';

describe('CoachLayoutComponent', () => {
    let component: CoachLayoutComponent;
    let fixture: ComponentFixture<CoachLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachLayoutComponent],
            imports: [FormsModule, RouterTestingModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
