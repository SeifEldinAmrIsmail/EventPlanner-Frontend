import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type ApiAttendance = 'going' | 'maybe' | 'not_going';

export interface SearchParams {
  q?: string;
  date_from?: string | undefined;
  date_to?: string | undefined;
  role?: 'organizer' | 'attendee' | undefined;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly base = '/events';

  constructor(private http: HttpClient) {}

  // ---------- CREATE ----------
  /** Accepts date (yyyy-mm-dd) + optional time (HH:mm) and sends ISO date-time to the API. */
  create(dto: {
    title: string;
    date: string;            // e.g. '2025-11-28'
    time?: string;           // e.g. '14:45'
    location?: string;
    description?: string;
    invitees?: string[];
  }): Observable<any> {
    const body: any = {
      title: dto.title,
      date: dto.time ? `${dto.date}T${dto.time}:00` : dto.date,
      location: dto.location ?? '',
      description: dto.description ?? '',
      invitees: dto.invitees ?? [],
    };
    return this.http.post<any>(`${this.base}/`, body, { withCredentials: true });
  }

  // ---------- LISTS ----------
  myOrganized(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/mine`, { withCredentials: true });
  }
  myInvited(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/invited`, { withCredentials: true });
  }

  // ---------- DETAIL / CRUD ----------
  getById(id: string): Observable<any> {
    return this.http.get<any>(`${this.base}/${encodeURIComponent(id)}`, { withCredentials: true });
  }
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${encodeURIComponent(id)}`, { withCredentials: true });
  }

  // ---------- ATTENDANCE ----------
  respond(eventId: string, status: ApiAttendance): Observable<any> {
    return this.http.post<any>(
      `${this.base}/${encodeURIComponent(eventId)}/respond`,
      { status },
      { withCredentials: true }
    );
  }

  // ---------- INVITES ----------
  /** Backend endpoint expected: POST /events/{id}/invite { invitees: string[] } */
  invite(eventId: string, invitees: string[]): Observable<void> {
    return this.http.post<void>(
      `${this.base}/${encodeURIComponent(eventId)}/invite`,
      { invitees },
      { withCredentials: true }
    );
  }

  // ---------- SEARCH ----------
  search(params: SearchParams): Observable<any[]> {
    const q = params.q ?? '';
    let hp = new HttpParams();
    if (params.date_from) hp = hp.set('date_from', params.date_from);
    if (params.date_to)   hp = hp.set('date_to', params.date_to);
    if (params.role)      hp = hp.set('role', params.role);
    return this.http.get<any[]>(
      `${this.base}/search/${encodeURIComponent(q)}`,
      { params: hp, withCredentials: true }
    );
  }
}
