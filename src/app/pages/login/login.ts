import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { UserService } from '../../services/user';

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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
      return;
    }

    this.errorMessage = null;
    const credentials = this.loginForm.value;

    this.api.login(credentials).subscribe({
      next: (data) => {
        if (data.token && data.user) {
          // บันทึกข้อมูลลง localStorage
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));

          // อัปเดตสถานะผู้ใช้ใน UserService
          this.userService.setUser(data.user);

          // ไปหน้า dashboard
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = "ข้อมูลที่ได้รับไม่ถูกต้อง";
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.errorMessage = err.error?.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ";
      }
    });
  }
}
