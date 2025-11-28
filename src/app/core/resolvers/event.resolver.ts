import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { EventService } from '../services/event.service';
import { EventDetail } from '../../core/models/event.model';

export const eventResolver: ResolveFn<EventDetail> = (route) => {
  const id = route.paramMap.get('id')!;
  return inject(EventService).getById(id);
};
