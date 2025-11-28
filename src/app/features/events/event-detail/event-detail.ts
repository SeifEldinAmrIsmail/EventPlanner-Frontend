import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { EventService } from '../../../core/services/event.service';
import { EventDetail, Attendee, AttendanceStatus } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],  // 👈 enable routerLink in template
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

  private load(id: string) {
    this.busy = true;
    this.api.getById(id)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: (evt) => (this.event = evt),
        error: () => (this.error = 'Failed to load event'),
      });
  }

  get goingList(): Attendee[] {
    return this.event?.attendees?.filter(a => a.status === 'Going') ?? [];
  }
  get maybeList(): Attendee[] {
    return this.event?.attendees?.filter(a => a.status === 'Maybe') ?? [];
  }
  get notGoingList(): Attendee[] {
    return this.event?.attendees?.filter(a => a.status === 'Not Going') ?? [];
  }

  respond(status: AttendanceStatus) {
    if (!this.event) return;
    this.busy = true;
    this.api.respond(this.event.id, status)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => this.load(this.event!.id),
        error: () => (this.error = 'Failed to update response'),
      });
  }

  deleteEvent() {
    if (!this.event) return;
    this.busy = true;
    this.api.delete(this.event.id)
      .pipe(finalize(() => (this.busy = false)))
      .subscribe({
        next: () => history.back(),
        error: () => (this.error = 'Failed to delete event'),
      });
  }

   get allAttendees() {
    return this.event?.attendees ?? [];
  }
}
