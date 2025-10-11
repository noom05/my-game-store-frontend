import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // <<< แก้ตรงนี้ ให้คืน any >>>
  get f(): any {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.invalid) {
      Object.values(this.f).forEach((control: any) => control.markAsTouched());
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง';
      return;
    }

    const payload = {
      username: this.f.username.value,
      email: this.f.email.value,
      password: this.f.password.value
    };

    this.loading = true;
    this.api.register(payload)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response) => {
          this.successMessage = '✅ สมัครสมาชิกสำเร็จ! กำลังนำท่านไปหน้าเข้าสู่ระบบ...';
          setTimeout(() => this.router.navigate(['/login']), 1500);
        },
        error: (err) => {
          console.error('Register error:', err);
          this.errorMessage = err?.error?.error || err?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
        }
      });
  }
}

