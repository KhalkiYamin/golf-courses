import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { CoachShellLayoutComponent } from './coach-layout.component';

describe('CoachShellLayoutComponent', () => {
    let component: CoachShellLayoutComponent;
    let fixture: ComponentFixture<CoachShellLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachShellLayoutComponent],
            imports: [FormsModule, RouterTestingModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachShellLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
