import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common'; 


@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string | null = null;

  // Inject FormBuilder และ Router เข้ามาใช้งาน
  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    // สร้างฟอร์มด้วย FormBuilder พร้อมกำหนด validation พื้นฐาน
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  async onSubmit(): Promise<void> {
    // ถ้าฟอร์มไม่สมบูรณ์ ให้หยุดทำงาน
    if (this.loginForm.invalid) {
      this.errorMessage = "กรุณากรอกชื่อผู้ใช้และรหัสผ่าน";
      return;
    }

    this.errorMessage = null; // เคลียร์ข้อความ error เก่า

    try {
      // ดึงค่าจากฟอร์มด้วย this.loginForm.value
      const { username, password } = this.loginForm.value;

      const res = await fetch(
        "https://games-database-main.onrender.com/user/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.token || !data.user) {
        this.errorMessage = data.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
        return;
      }

      // เก็บ token และ user ลง localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // เปลี่ยนหน้าไปที่ dashboard
      this.router.navigate(['/dashboard']);

    } catch (err) {
      console.error(err);
      this.errorMessage = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
    }
  }
}
