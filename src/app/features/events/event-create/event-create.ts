import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../core/services/event.service';

@Component({
  selector: 'app-event-create',
  standalone: true,
  // 👇 RouterModule enables [routerLink] on “Back to home” and “Cancel”
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './event-create.html',
  styleUrls: ['./event-create.css'],
})
export class EventCreateComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private eventSvc = inject(EventService);

  submitting = false;
  error: string | null = null;

  form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    date: ['', Validators.required],
    time: ['', Validators.required],
    location: [''],
    description: [''],
  });

  get f() { return this.form.controls; }

  async submit(): Promise<void> {
    if (this.form.invalid || this.submitting) return;
    this.submitting = true;
    this.error = null;

    try {
      const payload = this.form.getRawValue();
      await firstValueFrom(this.eventSvc.create(payload));

      // ⬇️ Go to Events List and carry a one-time toast message
      await this.router.navigate(['/events'], {
        state: { success: 'Event created successfully.' },
      });
    } catch (e: any) {
      this.error =
        e?.error?.detail ||
        e?.message ||
        'Failed to create event. Please try again.';
    } finally {
      this.submitting = false;
    }
  }
}
