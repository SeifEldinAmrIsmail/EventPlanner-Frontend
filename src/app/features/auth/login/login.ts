import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent implements OnDestroy {
  email = '';
  password = '';

  error: string | null = null;
  success: string | null = null;

  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async onSubmit(): Promise<void> {
    this.clearToasts();

    const email = this.email.trim();
    if (!email || !this.password) {
      this.showError('Please enter email and password.');
      return;
    }

    try {
      // Calls backend, stores access_token in localStorage
      await this.auth.login(email, this.password);

      this.showSuccess('Logged in successfully.');

      // If we were redirected here by the guard, go back there; otherwise go to /home
      const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/home';
      this.router.navigateByUrl(redirect, { replaceUrl: true });
    } catch {
      this.showError('Login failed. Please check your credentials.');
    }
  }

  // --- Toast helpers --------------------------------------------------------
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

  ngOnDestroy(): void {
    if (this.toastTimer) clearTimeout(this.toastTimer);
  }
}
