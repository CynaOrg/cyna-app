import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { isNativeCapacitor } from '@core/utils/platform.utils';

@Component({
  selector: 'app-register',
  templateUrl: 'register.page.html',
  standalone: false,
})
export class RegisterPage {
  isNative = isNativeCapacitor();
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.form.valid) {
      // TODO: connect to auth service
      console.log(this.form.value);
    }
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}
