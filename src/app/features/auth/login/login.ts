import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  // form fields
  email: string = '';
  password: string = '';

  // ui feedback
  error: string | null = null;
  success: string | null = null;

  private toastTimer: any = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    // clear any previous message
    this.clearToasts();

    // basic guard
    if (!this.email || !this.password) {
        this.showError('Please enter email and password.');
        return;
    }

    // call backend via AuthService
    this.auth.login(this.email, this.password)
      .then(res => {
        // res should be { access_token, ... } from FastAPI
        this.showSuccess('Logged in successfully.');

        // TODO later:
        // save token, navigate to dashboard, etc.
        // this.router.navigate(['/dashboard']);
      })
      .catch(err => {
        // backend failed / wrong creds / network
        this.showError('Login failed. Please check your credentials.');
      });
  }

  // helper to show success toast for 5s
  private showSuccess(msg: string) {
    this.success = msg;
    this.error = null;
    this.autoHideToast();
  }

  // helper to show error toast for 5s
  private showError(msg: string) {
    this.error = msg;
    this.success = null;
    this.autoHideToast();
  }

  // start 5-second auto hide timer
  private autoHideToast() {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => {
      this.clearToasts();
    }, 5000);
  }

  private clearToasts() {
    this.error = null;
    this.success = null;
  }
}
