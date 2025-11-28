export type AttendanceStatus = 'Going' | 'Maybe' | 'Not Going';

export interface Attendee {
  email: string;
  status: AttendanceStatus;
  is_me?: boolean;
}

export interface EventSummary {
  id: string;
  title: string;
  date: string;      // ISO yyyy-MM-dd
  time: string;      // HH:mm
  location: string;
  role?: 'organizer' | 'attendee';
}

export interface EventDetail extends EventSummary {
  description?: string;
  organizer_id: string;
  attendees: Attendee[];
}

export interface EventInput {
  title: string;
  date: string;
  time: string;
  location: string;
  description?: string;
}
