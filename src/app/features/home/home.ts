import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { EventService } from '../../core/services/event.service';
import { EventSummary } from '../../core/models/event.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private readonly svc = inject(EventService);

  organizing: EventSummary[] = [];
  invited: EventSummary[] = [];
  loading = true;
  error: string | null = null;

  private toSummary(raw: any): EventSummary {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      date: String(raw.date ?? ''),
      time: String(raw.time ?? ''),
      location: String(raw.location ?? ''),
    };
  }

  ngOnInit(): void {
    forkJoin({
      mine: this.svc.myOrganized().pipe(
        catchError(() => of([] as any[])),
        map((arr) => (arr ?? []).map((x) => this.toSummary(x)))
      ),
      invited: this.svc.myInvited().pipe(
        catchError(() => of([] as any[])),
        map((arr) => (arr ?? []).map((x) => this.toSummary(x)))
      ),
    })
      .pipe(
        map(({ mine, invited }) => ({
          organizing: (mine ?? []).slice(0, 5),
          invited: (invited ?? []).slice(0, 5),
        })),
        finalize(() => (this.loading = false))
      )
      .subscribe({
        next: ({ organizing, invited }) => {
          this.organizing = organizing;
          this.invited = invited;
        },
        error: (err) =>
          (this.error = err?.message ?? 'Failed to load your events.'),
      });
  }

  /** Build an ISO-like string for the Angular date pipe in the template */
  iso = (e: EventSummary): string => `${e.date}T${e.time}:00`;

  /** TrackBy helper for ngFor */
  trackById = (_: number, e: EventSummary): string => e.id;
}
