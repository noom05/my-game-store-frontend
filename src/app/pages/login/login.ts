import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common'; 
import { Api } from '../../services/api'; // Import Api service

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
    private api: Api // Inject Api service
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = "กรุณากรอกข้อมูลให้ครบถ้วน";
      return;
    }

    this.errorMessage = null;
    
    // เรียกใช้ฟังก์ชัน login จาก Api service
    this.api.login(this.loginForm.value).subscribe({
      next: (data) => {
        // ตรวจสอบว่ามี token และ user object กลับมาหรือไม่
        if (data && data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          this.router.navigate(['/dashboard']);
        } else {
          this.errorMessage = "ข้อมูลที่ได้รับไม่ถูกต้อง";
        }
      },
      error: (err) => {
        console.error("Login error:", err);
        // แสดงข้อความ error ที่ได้จาก Backend
        this.errorMessage = err.error?.error || "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
      }
    });
  }
}
