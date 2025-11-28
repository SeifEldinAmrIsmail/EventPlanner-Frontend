import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css'],
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventSvc = inject(EventService);

  submitting = false;
  error: string | null = null;
  success = '';

  // chips state
  inviteDraft = '';
  invitees: string[] = [];

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    location: [''],
    description: [''],
  });

  get f() { return this.form.controls; }

  addInvite(force = false) {
    const raw = this.inviteDraft.trim();
    if (!raw && !force) return;

    const parts = raw.split(/[\s,;]+/).map(s => s.trim()).filter(Boolean);
    for (const p of parts) {
      if (!this.invitees.includes(p)) this.invitees.push(p);
    }
    this.inviteDraft = '';
  }
  removeInvite(i: number) { this.inviteeesSafeRemove(i); }
  private inviteeesSafeRemove(i: number) {
    if (i >= 0 && i < this.invitees.length) this.invitees.splice(i, 1);
  }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.error = null;

    try {
      const payload = { ...this.form.getRawValue(), invitees: this.invitees };
      const res: any = await firstValueFrom(this.eventSvc.create(payload));
      // show a quick toast then go to /events (list)
      this.success = 'Event created & invites sent.';
      setTimeout(async () => {
        this.success = '';
        await this.router.navigate(['/events']);
      }, 3000);
    } catch (e: any) {
      this.error = e?.error?.detail || e?.message || 'Failed to create event. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
