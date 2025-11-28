import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EventInput, EventSummary, EventDetail, AttendanceStatus,
} from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/events`;

  /** Organizer creates an event */
  create(body: EventInput): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(`${this.base}`, body);
  }

  /** Events I organize */
  myOrganized(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${this.base}/mine`);
  }

  /** Events I’m invited to */
  myInvited(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${this.base}/invited`);
  }

  getById(id: string): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.base}/${id}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  /** Invite by email */
  invite(id: string, email: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.base}/${id}/invite`, { email });
  }

  /** Attendee sets status */
  respond(id: string, status: AttendanceStatus): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(`${this.base}/${id}/response`, { status });
  }

  /** Search + filters */
  search(opts: { q?: string; from?: string; to?: string; role?: 'organizer' | 'attendee' })
    : Observable<EventSummary[]> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.from) params = params.set('from', opts.from);
    if (opts.to) params = params.set('to', opts.to);
    if (opts.role) params = params.set('role', opts.role);
    return this.http.get<EventSummary[]>(`${this.base}/search`, { params });
  }
}
