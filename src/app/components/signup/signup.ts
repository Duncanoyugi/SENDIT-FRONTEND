import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../shared/toast/toast.service';
import { AuthService, CreateUserDto } from '../../services/auth.service';
import { ParcelsService, Parcel } from '../../services/parcels.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css']
})
export class Signup {
  showPassword = false;
  isLoading = false;
  checkingParcels = false;
  anonymousParcels: Parcel[] = [];
  showParcelsFound = false;

  firstName = '';
  lastName = '';

  signupData: CreateUserDto = {
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'CUSTOMER'
  };

  private emailCheckTimer: any;

  constructor(
    private toastService: ToastService,
    private router: Router,
    private authService: AuthService,
    private parcelsService: ParcelsService
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onEmailChange() {
    if (this.emailCheckTimer) {
      clearTimeout(this.emailCheckTimer);
    }

    this.anonymousParcels = [];
    this.showParcelsFound = false;

    if (this.signupData.email && this.isValidEmail(this.signupData.email)) {
      this.emailCheckTimer = setTimeout(() => {
        this.checkAnonymousParcels();
      }, 500);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private checkAnonymousParcels() {
    this.checkingParcels = true;

    this.parcelsService.getAnonymousParcels(this.signupData.email).subscribe({
      next: (parcels) => {
        this.checkingParcels = false;
        this.anonymousParcels = parcels || [];
        this.showParcelsFound = this.anonymousParcels.length > 0;

        if (this.anonymousParcels.length > 0) {
          this.toastService.showInfo(`Found ${this.anonymousParcels.length} parcel(s) linked to this email.`);
        }
      },
      error: (error) => {
        this.checkingParcels = false;
        console.error('Error checking anonymous parcels:', error);
        this.anonymousParcels = [];
        this.showParcelsFound = false;
      }
    });
  }

  onSubmit() {
    const fullName = `${this.firstName.trim()} ${this.lastName.trim()}`;
    this.signupData.name = fullName;

    if (!this.firstName || !this.lastName || !this.signupData.email || !this.signupData.password || !this.signupData.phone) {
      this.toastService.showError('Please fill in all required fields');
      return;
    }

    if (!this.isValidEmail(this.signupData.email)) {
      this.toastService.showError('Please enter a valid email');
      return;
    }

    if (this.signupData.password.length < 6) {
      this.toastService.showError('Password must be at least 6 characters');
      return;
    }

    if (fullName.length < 2) {
      this.toastService.showError('Full name must be at least 2 characters');
      return;
    }

    this.isLoading = true;

    this.authService.register(this.signupData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (this.anonymousParcels.length > 0) {
          this.toastService.showSuccess(`Account created. ${this.anonymousParcels.length} parcel(s) linked.`);
        } else {
          this.toastService.showSuccess('Account created. Please log in.');
        }
        this.redirectBasedOnRole(response.user.role);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration failed:', error);
      }
    });
  }

  private redirectBasedOnRole(role: string) {
    this.router.navigate(['/login']);
  }
}
