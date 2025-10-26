import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../services/api';
import { CommonModule } from '@angular/common';

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

  // v----------- จุดที่แก้ไข -----------v
  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง';
      return;
    }

    this.errorMessage = null;
    this.successMessage = null;

    // 1. สร้าง "กล่องพัสดุ" (FormData)
    const formData = new FormData();
    
    // 2. นำข้อมูลจากฟอร์มมา "ใส่กล่อง"
    formData.append('username', this.registerForm.value.username);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);
    // (ในอนาคตถ้ามีช่องเลือกไฟล์ ก็สามารถ append ไฟล์เข้ามาตรงนี้ได้เลย)
    // formData.append('file', this.selectedFile);

    // 3. ส่ง "กล่องพัสดุ" ไปให้พนักงานเสิร์ฟ
    this.api.register(formData).subscribe({
      next: (response) => {
        this.successMessage = "✅ สมัครสมาชิกสำเร็จ! กำลังนำท่านไปหน้าเข้าสู่ระบบ...";
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.errorMessage = err.error?.error || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      }
    });
  }
  // ^----------- สิ้นสุดจุดที่แก้ไข -----------^
}
