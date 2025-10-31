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
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  email: string = '';
  password: string = '';

  error: string | null = null;
  success: string | null = null;

  private toastTimer: any = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.clearToasts();

    if (!this.email || !this.password) {
      this.showError('Please enter email and password.');
      return;
    }

    if (this.password.length < 6) {
      this.showError('Password must be at least 6 characters.');
      return;
    }

    this.auth.register(this.email, this.password)
      .then(res => {
        this.showSuccess('Account created successfully.');


      })
      .catch(err => {
        this.showError('Registration failed. That email may already exist.');
      });
  }

  private showSuccess(msg: string) {
    this.success = msg;
    this.error = null;
    this.autoHideToast();
  }

  private showError(msg: string) {
    this.error = msg;
    this.success = null;
    this.autoHideToast();
  }

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
