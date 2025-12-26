import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  EventInput,
  EventSummary,
  EventDetail,
  AttendanceStatus,
} from '../models/event.model';

@Injectable({ providedIn: 'root' })
export class EventService {
  private http = inject(HttpClient);

  // environment.apiUrl = '/api'  => base becomes '/api/events'
  private base = `${environment.apiUrl}/events`;

  /** Organizer creates an event
   * Backend expects POST /events/ (trailing slash)
   * So we MUST call /api/events/ to avoid FastAPI redirect that drops /api
   */
  create(body: EventInput): Observable<EventDetail> {
    return this.http.post<EventDetail>(`${this.base}/`, body);
  }

  /** Events I organize */
  myOrganized(): Observable<EventSummary[]> {
    return this.http.get<EventSummary[]>(`${this.base}/mine`);
  }

  /** Events I’m invited to */
  myInvited(): Observable<EventDetail[]> {
    return this.http.get<EventDetail[]>(`${this.base}/invited`);
  }

  getById(id: string): Observable<EventDetail> {
    return this.http.get<EventDetail>(`${this.base}/${encodeURIComponent(id)}`);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`);
  }

  /** Invite endpoint: keep only if it exists in backend */
  invite(id: string, email: string): Observable<{ ok: true }> {
    return this.http.post<{ ok: true }>(
      `${this.base}/${encodeURIComponent(id)}/invite`,
      { email }
    );
  }

  /** Attendee sets status (FIXED: /respond not /response) */
  respond(id: string, status: AttendanceStatus): Observable<EventDetail> {
    return this.http.post<EventDetail>(
      `${this.base}/${encodeURIComponent(id)}/respond`,
      { status }
    );
  }

  /** Search + filters */
  search(params: {
    q?: string;
    date_from?: string;
    date_to?: string;
    role?: 'organizer' | 'attendee';
  }): Observable<EventSummary[]> {
    const keyword = (params.q ?? '').trim();

    let hp = new HttpParams();
    if (params.date_from) hp = hp.set('date_from', params.date_from);
    if (params.date_to) hp = hp.set('date_to', params.date_to);
    if (params.role) hp = hp.set('role', params.role);

    return this.http.get<EventSummary[]>(
      `${this.base}/search/${encodeURIComponent(keyword)}`,
      { params: hp }
    );
  }
}
