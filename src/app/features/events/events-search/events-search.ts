import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  startWith,
  catchError,
  of,
  finalize,
} from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventSummary } from '../../../core/models/event.model';

@Component({
  selector: 'app-events-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './events-search.html',
  styleUrls: ['./events-search.css'],
})
export class EventsSearchComponent {
  // ✅ use inject() so it's available for field initializers
  private fb = inject(FormBuilder);

  constructor(private svc: EventService) {
    this.initLiveSearch();
  }

  busy = false;
  error = '';
  results: EventSummary[] = [];

  form = this.fb.nonNullable.group({
    q: [''],
    from: [''], // yyyy-MM-dd
    to: [''],
    role: ['all' as 'all' | 'organizer' | 'attendee'],
  });

  private initLiveSearch() {
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        startWith(this.form.value),
        switchMap((v) => {
          const role =
            v.role && v.role !== 'all' ? (v.role as 'organizer' | 'attendee') : undefined;

          this.busy = true;
          this.error = '';

          return this.svc
            .search({
              q: v.q?.trim() || undefined,
              from: v.from || undefined,
              to: v.to || undefined,
              role,
            })
            .pipe(
              catchError((e) => {
                this.error = e?.error?.detail || e?.message || 'Search failed';
                return of([] as EventSummary[]);
              }),
              finalize(() => (this.busy = false)),
            );
        })
      )
      .subscribe((rows) => (this.results = rows));
  }

  clear() {
    this.form.reset({ q: '', from: '', to: '', role: 'all' });
  }
}
