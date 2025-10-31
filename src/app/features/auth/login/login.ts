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

    this.auth.login(this.email, this.password)
      .then(res => {
        this.showSuccess('Logged in successfully.');


      })
      .catch(err => {
        this.showError('Login failed. Please check your credentials.');
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
