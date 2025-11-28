import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class RegisterComponent {
  email = '';
  password = '';

  error: string | null = null;
  success: string | null = null;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  async onSubmit(): Promise<void> {
    this.clearToasts();

    const email = this.email.trim();
    if (!email || !this.password) {
      this.showError('Please enter email and password.');
      return;
    }
    if (this.password.length < 6) {
      this.showError('Password must be at least 6 characters.');
      return;
    }

    try {
      await this.auth.register(email, this.password);
      this.showSuccess('Account created successfully.');
      // Go to login and optionally prefill the email
      this.router.navigate(['/login'], { queryParams: { email } });
    } catch {
      this.showError('Registration failed. That email may already exist.');
    }
  }

  private showSuccess(msg: string): void {
    this.success = msg;
    this.error = null;
    this.autoHideToast();
  }

  private showError(msg: string): void {
    this.error = msg;
    this.success = null;
    this.autoHideToast();
  }

  private autoHideToast(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.clearToasts(), 5000);
  }

  private clearToasts(): void {
    this.error = null;
    this.success = null;
  }
}
