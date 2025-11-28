import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { EventService, SearchParams } from '../../../core/services/event.service';

type RoleFilter = '' | 'organizer' | 'attendee' | null;

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
    date_from: this.fb.control<string>(''),
    date_to: this.fb.control<string>(''),
    role: this.fb.control<RoleFilter>(''),
  });

  results: any[] = [];
  busy = false;
  error = '';

  async submit() {
    this.busy = true;
    this.error = '';
    try {
      const v = this.form.getRawValue();
      const params: SearchParams = {
        q: (v.q ?? '').trim() || undefined,
        date_from: v.date_from || undefined,
        date_to: v.date_to || undefined,
        role: (v.role || undefined) as 'organizer' | 'attendee' | undefined,
      };
      this.results = await firstValueFrom(this.svc.search(params));
    } catch (e: any) {
      this.error = e?.message ?? 'Search failed';
    } finally {
      this.busy = false;
    }
  }

  clear() {
    this.form.reset({ q: '', date_from: '', date_to: '', role: '' });
    this.results = [];
  }

  // <-- This is what your template calls
  toggleRole(target: 'organizer' | 'attendee') {
    const current = this.form.controls.role.value;
    this.form.controls.role.setValue(current === target ? '' : target);
  }
}
