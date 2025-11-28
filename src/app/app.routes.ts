import { Routes } from '@angular/router';

import { LoginComponent } from './features/auth/login/login';
import { RegisterComponent } from './features/auth/register/register';
import { HomeComponent } from './features/home/home';

import { EventsListComponent } from './features/events/events-list/events-list';
import { EventCreateComponent } from './features/events/event-create/event-create';
import { EventDetailComponent } from './features/events/event-detail/event-detail';
import { EventsSearchComponent } from './features/events/events-search/events-search';

import { authGuard } from './core/guards/auth.guard';
import { eventResolver } from './core/resolvers/event.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },

  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'events',
    canActivate: [authGuard],
    children: [
      { path: '', component: EventsListComponent },
      { path: 'new', component: EventCreateComponent },
      { path: 'search', component: EventsSearchComponent },
      { path: ':id', component: EventDetailComponent, resolve: { event: eventResolver } },
    ],
  },

  { path: '**', redirectTo: 'home' },
];
