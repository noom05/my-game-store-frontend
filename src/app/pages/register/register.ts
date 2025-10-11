import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [CommonModule, // สำหรับ *ngIf, *ngFor
    RouterModule,
    ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register implements OnInit {

  //--- Properties ---
  registerForm!: FormGroup;
  selectedFile: File | null = null;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  //--- Constructor ---
  // Inject services ที่จำเป็นเข้ามาใช้งาน
  constructor(
    private fb: FormBuilder,
    private router: Router
  ) { }

  //--- Lifecycle Hooks ---
  // ngOnInit จะทำงานครั้งแรกเมื่อหน้าเว็บนี้ถูกสร้างขึ้น
  ngOnInit(): void {
    // สร้างฟอร์มด้วย FormBuilder พร้อมกำหนด Validation
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  //--- Methods ---

  // เมธอดสำหรับจัดการเมื่อผู้ใช้เลือกไฟล์รูปภาพ
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  // เมธอดหลักที่จะทำงานเมื่อผู้ใช้กดปุ่ม Submit ฟอร์ม
  async onSubmit(): Promise<void> {
    // เช็กว่าข้อมูลในฟอร์มสมบูรณ์หรือไม่
    if (this.registerForm.invalid) {
      this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง';
      return;
    }

    // เคลียร์ข้อความเก่า
    this.errorMessage = null;
    this.successMessage = null;

    // สร้าง FormData เพื่อเตรียมส่งข้อมูลไปที่ API
    const formData = new FormData();
    formData.append('username', this.registerForm.value.username);
    formData.append('email', this.registerForm.value.email);
    formData.append('password', this.registerForm.value.password);

    // ถ้ามีการเลือกไฟล์รูปภาพ ให้เพิ่มเข้าไปใน FormData ด้วย
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    try {
      const response = await fetch(
        "https://games-database-main.onrender.com/user/register",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      // จัดการกับ Error ที่มาจาก Server
      if (!response.ok) {
        this.errorMessage = data.error || "สมัครสมาชิกไม่สำเร็จ";
        return;
      }

      // เมื่อสมัครสมาชิกสำเร็จ
      this.successMessage = "✅ สมัครสมาชิกสำเร็จ! กำลังนำท่านไปหน้าเข้าสู่ระบบ...";

      // รอ 2 วินาที แล้วค่อยเปลี่ยนหน้าไปที่ Login
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);

    } catch (err: any) {
      this.errorMessage = "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ: " + err.message;
      console.error(err);
    }
  }

  // เมธอดสำหรับนำทางไปหน้า Login
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
