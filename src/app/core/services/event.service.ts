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
search(params: {
  q?: string;
  date_from?: string;
  date_to?: string;
  role?: 'organizer' | 'attendee';
}) {
  const keyword = (params.q ?? '').trim();            // <-- path part
  let hp = new HttpParams();
  if (params.date_from) hp = hp.set('date_from', params.date_from);
  if (params.date_to)   hp = hp.set('date_to', params.date_to);
  if (params.role)      hp = hp.set('role', params.role);

  // IMPORTANT: keyword goes in the path
  return this.http.get<any[]>(
    `${this.base}/search/${encodeURIComponent(keyword)}`,
    { params: hp, withCredentials: true }
  );
}
}
