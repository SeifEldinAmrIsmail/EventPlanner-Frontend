import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventSummary } from '../../../core/models/event.model';

// ✅ include "all" so comparisons in the template are type-safe
type RoleFilter = '' | 'all' | 'organizer' | 'attendee';

@Component({
  selector: 'app-events-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './events-search.html',
  styleUrls: ['./events-search.css'],
})
export class EventsSearchComponent {
  private fb = inject(FormBuilder);
  private svc = inject(EventService);

  form = this.fb.group({
    q: this.fb.control<string>(''),
    // ✅ use date_from / date_to (service & backend expect these)
    date_from: this.fb.control<string>(''),
    date_to: this.fb.control<string>(''),
    role: this.fb.control<RoleFilter>('all'),
  });

  results: EventSummary[] = [];
  busy = false;
  error = '';

  async submit() {
    this.busy = true;
    this.error = '';
    try {
      const v = this.form.getRawValue();

      // Normalize values for the API
      const q = (v.q ?? '').trim();
      const params = {
        // keep undefined when empty so the backend ignores the filter
        date_from: v.date_from || undefined,
        date_to: v.date_to || undefined,
        role:
          v.role === 'all' || v.role === ''
            ? undefined
            : (v.role as 'organizer' | 'attendee' | undefined),
      };

      // service will hit: /events/search/{q}
      this.results = await firstValueFrom(this.svc.search({ q, ...params }));
    } catch (e: any) {
      this.error = e?.message ?? 'Search failed';
    } finally {
      this.busy = false;
    }
  }

  clear() {
    this.form.reset({
      q: '',
      date_from: '',
      date_to: '',
      role: 'all',
    });
    this.results = [];
  }

  setRole(r: RoleFilter) {
    this.form.patchValue({ role: r });
  }

  private sanitizer = inject(DomSanitizer);

// escape regex special chars in the query
private esc(term: string) {
  return term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// returns title with <mark class="hit">…</mark> around the query
highlight(text: string): SafeHtml {
  const q = (this.form.value.q ?? '').trim();
  if (!q) return text;

  const re = new RegExp(`(${this.esc(q)})`, 'ig');
  const html = (text ?? '').replace(re, '<mark class="hit">$1</mark>');
  return this.sanitizer.bypassSecurityTrustHtml(html);
}
}
