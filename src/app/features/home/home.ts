import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';

import { EventService } from '../../core/services/event.service';
import { EventSummary } from '../../core/models/event.model';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent implements OnInit {
  private events = inject(EventService);
  private auth = inject(AuthService);

  organizing: EventSummary[] = [];
  invited: EventSummary[] = [];
  loading = true;
  isAuthed = false;

  ngOnInit(): void {
    // ✅ Simple, correct auth check
    this.isAuthed = this.auth.isLoggedIn();

    if (!this.isAuthed) {
      // Guest: just render static hero/tiles, no API calls
      this.loading = false;
      return;
    }

    // Authenticated: load previews for "Organizing" and "Invited"
    forkJoin({
      mine: this.events.myOrganized(),
      invited: this.events.myInvited(),
    }).subscribe({
      next: ({ mine, invited }) => {
        this.organizing = (mine ?? []).slice(0, 5);
        this.invited = (invited ?? []).slice(0, 5);
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      },
    });
  }

  iso(e: EventSummary): string {
    return `${e.date}T${e.time}:00`;
  }

  trackById(_: number, e: EventSummary): string {
    return e.id;
  }
}
