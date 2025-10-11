import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

// Mock Data: ในโปรเจกต์จริง ข้อมูลนี้ควรมาจาก Service ที่เรียก API
const GAMES_DATA: { [key: string]: any } = {
  fc26: {
    title: "EA SPORTS FC™ 26 ULTIMATE EDITION",
    description: `ครอบคลุมที่สุดกับประสบการณ์การเล่น...`,
    lastDate: "2025-09-26",
    genre: "กีฬา / ฟุตบอล",
    price: 1999,
    image: "/assets/fc26.jpg",
  },
};

@Component({
  selector: 'app-edit-game',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edit-game.html',
  styleUrl: './edit-game.css'
})
export class EditGame implements OnInit {

  editGameForm!: FormGroup;
  gameId: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // 1. สร้างฟอร์มเปล่าๆ ก่อน
    this.editGameForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      lastDate: ['', Validators.required],
      genre: [''],
      price: [0, [Validators.required, Validators.min(0)]]
    });

    // 2. ดึง ID ของเกมจาก URL
    this.gameId = this.route.snapshot.paramMap.get('id');

    if (this.gameId) {
      // 3. โหลดข้อมูลเกมเดิมมาใส่ในฟอร์ม
      const existingGame = GAMES_DATA[this.gameId];
      if (existingGame) {
        this.editGameForm.patchValue(existingGame); // ใช้ patchValue เพื่อเติมข้อมูลในฟอร์ม
        this.imagePreview = existingGame.image; // แสดงรูปภาพเดิมเป็นค่าเริ่มต้น
      } else {
        alert('ไม่พบข้อมูลเกม');
        this.router.navigate(['/dashboard']);
      }
    }
  }

  // ฟังก์ชันจัดการเมื่อผู้ใช้เลือกไฟล์ใหม่
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      
      // สร้างภาพตัวอย่าง
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  // ฟังก์ชันทำงานเมื่อกดบันทึก
  onSubmit(): void {
    if (this.editGameForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    // ในโปรเจกต์จริง ส่วนนี้จะเป็นการส่งข้อมูล (this.editGameForm.value)
    // และไฟล์ (this.selectedFile) ไปยัง API เพื่อบันทึก
    console.log('ข้อมูลที่บันทึก:', this.editGameForm.value);
    console.log('ไฟล์ที่เลือก:', this.selectedFile);

    alert("✅ บันทึกข้อมูลเกมเรียบร้อยแล้ว!");
    this.router.navigate(['/dashboard']);
  }
}
