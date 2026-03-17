import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { AthleteShellLayoutComponent } from './athlete-layout.component';

describe('AthleteShellLayoutComponent', () => {
    let component: AthleteShellLayoutComponent;
    let fixture: ComponentFixture<AthleteShellLayoutComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AthleteShellLayoutComponent],
            imports: [RouterTestingModule]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AthleteShellLayoutComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
