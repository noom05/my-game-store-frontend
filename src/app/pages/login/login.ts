import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api'; // 1. Import Api service

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  // 2. Inject Api service เข้ามาใช้งาน
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // 3. แก้ไข onSubmit ให้เรียกใช้ Api service
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
      return;
    }

    this.errorMessage = null;

    const credentials = this.loginForm.value;

    // 4. เรียกใช้ api.login() และจัดการผลลัพธ์ด้วย subscribe
    this.api.login(credentials).subscribe({
      next: (data) => {
        // เมื่อ Login สำเร็จ
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = "ข้อมูลที่ได้รับไม่ถูกต้อง";
        }
      },
      error: (err) => {
        // เมื่อเกิด Error จาก API
        console.error('Login error:', err);
        this.errorMessage = err.error.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      }
    });
  }
}
