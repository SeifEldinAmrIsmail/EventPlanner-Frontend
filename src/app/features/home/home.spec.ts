import { TestBed } from '@angular/core/testing';
import { HomeComponent } from './home';
import { EventService } from '../../core/services/event.service';
import { of } from 'rxjs';

describe('HomeComponent', () => {
  const svcStub: Partial<EventService> = {
    myOrganized: () =>
      of([{ id: '1', title: 'Demo Event', date: '2025-12-01', time: '10:00', location: 'Cairo' }]),
    myInvited: () => of([]),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent], // standalone component
      providers: [{ provide: EventService, useValue: svcStub }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
  });

  it('should render organizing preview item title', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    fixture.detectChanges(); // triggers ngOnInit + async data
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Demo Event');
  });
});
