import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, forkJoin } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventSummary } from '../../../core/models/event.model';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events-list.html',
  styleUrls: ['./events-list.css'],
})
export class EventsListComponent implements OnInit {
  busy = false;
  error = '';
  success = '';

  segment: 'organized' | 'invited' = 'organized';
  q = '';

  organized: EventSummary[] = [];
  invited: EventSummary[] = [];

  constructor(private svc: EventService, private router: Router) {
    // Pick up success message whether it comes from a normal navigate
    // or from browser history (fallback).
    const navMsg = this.router.getCurrentNavigation()?.extras?.state?.['success'];
    const histMsg = (history.state && history.state['success']) as string | undefined;
    const msg = (navMsg || histMsg) as string | undefined;

    if (msg) {
      this.success = msg;
      setTimeout(() => (this.success = ''), 3000); // 3 seconds
    }
  }

  async ngOnInit() {
    await this.load();
  }

  async load() {
    this.busy = true;
    this.error = '';
    try {
      const [mine, inv] = await firstValueFrom(
        forkJoin([this.svc.myOrganized(), this.svc.myInvited()])
      );
      this.organized = mine;
      this.invited = inv;
    } catch (e: any) {
      this.error = e?.error?.detail || e?.message || 'Failed to load events';
      setTimeout(() => (this.error = ''), 3000);
    } finally {
      this.busy = false;
    }
  }

  get source(): EventSummary[] {
    return this.segment === 'organized' ? this.organized : this.invited;
  }

  get results(): EventSummary[] {
    const q = this.q.trim().toLowerCase();
    if (!q) return this.source;
    return this.source.filter((e) =>
      [e.title, e.location, e.date, e.time].filter(Boolean).join(' ')
        .toLowerCase()
        .includes(q)
    );
  }

  view(id: string) {
    this.router.navigate(['/events', id]);
  }

  async remove(id: string) {
    if (this.segment !== 'organized') return;
    const ok = confirm('Delete this event? This cannot be undone.');
    if (!ok) return;

    this.busy = true;
    try {
      await firstValueFrom(this.svc.delete(id));
      this.organized = this.organized.filter((e) => e.id !== id);
      this.success = 'Event deleted';
      setTimeout(() => (this.success = ''), 3000);
    } catch (e: any) {
      this.error = e?.error?.detail || e?.message || 'Delete failed';
      setTimeout(() => (this.error = ''), 3000);
    } finally {
      this.busy = false;
    }
  }
}
