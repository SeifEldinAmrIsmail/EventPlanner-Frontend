import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize, map } from 'rxjs/operators';

import { EventService } from '../../../core/services/event.service';
import { EventDetail, Attendee, AttendanceStatus } from '../../../core/models/event.model';

// Local alias so we don't depend on a type re-exported by the service
type ApiAttendance = 'going' | 'maybe' | 'not_going';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-detail.html',
  styleUrls: ['./event-detail.css'],
})
export class EventDetailComponent {
  private route = inject(ActivatedRoute);
  private api = inject(EventService);

  event?: EventDetail;
  busy = false;
  error = '';

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.load(id);
  }

  /** Bring API shape to strict UI model (ensures required strings exist). */
  private toModelDetail(raw: any): EventDetail {
    return {
      id: String(raw.id),
      title: String(raw.title ?? ''),
      date: String(raw.date ?? ''),
      time: String(raw.time ?? ''),
      location: String(raw.location ?? ''),
      description: String(raw.description ?? ''),
      organizer_id: String(raw.organizer_id ?? raw.organizerId ?? ''), // tolerate either
      attendees: Array.isArray(raw.attendees) ? raw.attendees : [],
    };
  }

  private load(id: string) {
    this.busy = true;
    this.api
      .getById(id)
      .pipe(
        map((raw) => this.toModelDetail(raw)),
        finalize(() => (this.busy = false))
      )
      .subscribe({
        next: (evt) => (this.event = evt),
        error: () => (this.error = 'Failed to load event'),
      });
  }

  get goingList(): Attendee[] {
    return this.event?.attendees?.filter((a) => a.status === 'Going') ?? [];
  }
  get maybeList(): Attendee[] {
    return this.event?.attendees?.filter((a) => a.status === 'Maybe') ?? [];
  }
  get notGoingList(): Attendee[] {
    return this.event?.attendees?.filter((a) => a.status === 'Not Going') ?? [];
  }

  // Map UI → API
  private readonly toApi: Record<AttendanceStatus, ApiAttendance> = {
    'Going': 'going',
    'Maybe': 'maybe',
    'Not Going': 'not_going',
  };

  respond(status: AttendanceStatus) {
    if (!this.event) return;
    this.busy = true;
    this.api
      .respond(this.event.id, this.toApi[status])
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => this.load(this.event!.id),
        error: () => (this.error = 'Failed to update response'),
      });
  }

  deleteEvent() {
    if (!this.event) return;
    this.busy = true;
    this.api
      .delete(this.event.id)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => history.back(),
        error: () => (this.error = 'Failed to delete event'),
      });
  }
}
