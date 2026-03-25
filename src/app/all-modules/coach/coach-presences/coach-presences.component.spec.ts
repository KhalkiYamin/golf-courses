import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { convertToParamMap, ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';

import { CoachPresenceComponent } from './coach-presences.component';
import { CoachPresenceService } from 'src/app/services/coach-presence.service';
import { CoachSeancesService } from 'src/app/services/coach-seances.service';

describe('CoachPresenceComponent', () => {
    let component: CoachPresenceComponent;
    let fixture: ComponentFixture<CoachPresenceComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [CoachPresenceComponent],
            imports: [FormsModule],
            providers: [
                {
                    provide: ActivatedRoute,
                    useValue: {
                        paramMap: of(convertToParamMap({})),
                        queryParamMap: of(convertToParamMap({}))
                    }
                },
                {
                    provide: Router,
                    useValue: {
                        navigate: jasmine.createSpy('navigate')
                    }
                },
                {
                    provide: CoachPresenceService,
                    useValue: {
                        getPresencesBySeance: () => of([]),
                        updatePresence: () => of({ athleteId: 1, nomComplet: 'Athlete Test', statut: 'PRESENT' })
                    }
                },
                {
                    provide: CoachSeancesService,
                    useValue: {
                        getMySeances: () => of([])
                    }
                }
            ]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CoachPresenceComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});