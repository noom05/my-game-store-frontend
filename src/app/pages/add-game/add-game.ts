import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-game',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-game.html',
  styleUrl: './add-game.css'
})
export class AddGame implements OnInit{
  // สร้าง FormGroup สำหรับฟอร์ม
  addGameForm!: FormGroup;
  // ตัวแปรสำหรับเก็บ URL ของรูปภาพที่พรีวิว
  imagePreview: string | ArrayBuffer | null = null;
  // ตัวแปรสำหรับเก็บไฟล์รูปภาพเพื่อส่งไป backend
  selectedFile: File | null = null;

  // Inject FormBuilder และ Router เข้ามาใช้งาน
  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    // กำหนดโครงสร้างของฟอร์มและ validation
    this.addGameForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      releaseDate: ['', Validators.required],
      genre: [''],
      price: ['', [Validators.required, Validators.min(0)]]
    });
  }

  // ฟังก์ชันทำงานเมื่อผู้ใช้เลือกไฟล์
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file; // เก็บไฟล์ไว้เพื่ออัปโหลด

      // สร้างพรีวิวรูปภาพ
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // ฟังก์ชันทำงานเมื่อผู้ใช้กด Submit ฟอร์ม
  onSubmit(): void {
    if (this.addGameForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    // สร้าง FormData เพื่อรวบรวมข้อมูลทั้งหมดสำหรับส่งไป API
    const formData = new FormData();
    formData.append('title', this.addGameForm.value.title);
    formData.append('description', this.addGameForm.value.description);
    formData.append('releaseDate', this.addGameForm.value.releaseDate);
    formData.append('genre', this.addGameForm.value.genre);
    formData.append('price', this.addGameForm.value.price);
    if (this.selectedFile) {
      formData.append('gameImage', this.selectedFile, this.selectedFile.name);
    }

    console.log('ข้อมูลที่จะส่งไป API:', this.addGameForm.value);
    console.log('ไฟล์รูป:', this.selectedFile);

    // ***** ณ จุดนี้ คุณจะเรียกใช้ ApiService เพื่อส่ง formData ไปยัง Backend *****
    // this.apiService.addGame(formData).subscribe(response => { ... });

    // โค้ดชั่วคราวตามฟังก์ชันเดิม
    alert("✅ เพิ่มเกมเรียบร้อยแล้ว!");
    this.router.navigate(['/dashboard']); // ใช้ Router ของ Angular ในการเปลี่ยนหน้า
  }
}
