import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { EventService } from '../../../core/services/event.service';
import { EventSummary } from '../../../core/models/event.model';

type ApiAttendance = 'going' | 'maybe' | 'not_going';

@Component({
  selector: 'app-events-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './events-list.html',
  styleUrls: ['./events-list.css'],
})
export class EventsListComponent implements OnInit {
  private svc = inject(EventService);
  private router = inject(Router);

  busy = false;
  error = '';
  success = '';
  segment: 'organized' | 'invited' = 'organized';
  q = '';

  organized: EventSummary[] = [];
  invited: EventSummary[] = [];

  inviteFor: string | null = null;
  inviteCsv = '';

  ngOnInit(): void {
    this.load();
  }

  private toSummary(raw: any): EventSummary {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      date: String(raw.date ?? ''),
      time: String(raw.time ?? ''),
      location: String(raw.location ?? ''),
    };
  }

  load(): void {
    this.busy = true;
    forkJoin({
      organized: this.svc.myOrganized().pipe(map(arr => (arr ?? []).map(x => this.toSummary(x)))),
      invited:   this.svc.myInvited().pipe(map(arr => (arr ?? []).map(x => this.toSummary(x)))),
    }).subscribe({
      next: ({ organized, invited }) => {
        this.organized = organized;
        this.invited = invited;
        this.busy = false;
      },
      error: (e) => {
        this.error = e?.error?.detail || e?.message || 'Failed to load events';
        this.busy = false;
        setTimeout(() => (this.error = ''), 3000);
      },
    });
  }

  get source(): EventSummary[] {
    return this.segment === 'organized' ? this.organized : this.invited;
  }

  get results(): EventSummary[] {
    const q = this.q.trim().toLowerCase();
    if (!q) return this.source;
    return this.source.filter((e: EventSummary) =>
      `${e.title ?? ''} ${e.location ?? ''} ${e.date ?? ''} ${e.time ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }

  view(id: string): void {
    this.router.navigate(['/events', id]);
  }

  remove(id: string): void {
    if (this.segment !== 'organized') return;
    if (!confirm('Delete this event? This cannot be undone.')) return;

    this.busy = true;
    this.svc.delete(id).subscribe({
      next: () => {
        this.organized = this.organized.filter(e => e.id !== id);
        this.success = 'Event deleted';
        this.busy = false;
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (e) => {
        this.error = e?.error?.detail || e?.message || 'Delete failed';
        this.busy = false;
        setTimeout(() => (this.error = ''), 3000);
      },
    });
  }

  // --- Invite flow ---
  toggleInvite(eventId: string | ''): void {
    this.inviteFor = eventId || null;
    this.inviteCsv = '';
  }

  sendInvites(): void {
    if (!this.inviteFor) return;
    const invitees = this.inviteCsv
      .split(/[\s,;]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (!invitees.length) return;

    this.busy = true;
    this.svc.invite(this.inviteFor, invitees).subscribe({
      next: () => {
        this.success = 'Invitations sent';
        this.busy = false;
        this.toggleInvite('');
        setTimeout(() => (this.success = ''), 3000);
      },
      error: (e) => {
        this.error = e?.error?.detail || e?.message || 'Failed to send invitations';
        this.busy = false;
        setTimeout(() => (this.error = ''), 3000);
      },
    });
  }

  // --- Quick RSVP for invitees ---
  respond(eventId: string, status: ApiAttendance): void {
    if (this.segment !== 'invited') return;
    this.busy = true;
    this.svc.respond(eventId, status).subscribe({
      next: () => {
        this.success = 'Response saved';
        this.busy = false;
        setTimeout(() => (this.success = ''), 2500);
      },
      error: (e) => {
        this.error = e?.error?.detail || e?.message || 'Failed to send response';
        this.busy = false;
        setTimeout(() => (this.error = ''), 3000);
      },
    });
  }
}
