import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormControl } from '@angular/forms';
import { Api } from '../../services/api';
import { forkJoin } from 'rxjs'; // ใช้สำหรับเรียก API หลายตัวพร้อมกัน

@Component({
  selector: 'app-edit-game',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './edit-game.html',
  styleUrls: ['./edit-game.css']
})
export class EditGame implements OnInit {

  editGameForm!: FormGroup;
  gameId: string | null = null;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  allTypes: any[] = [];
  isLoading = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // 1. สร้างฟอร์มเปล่าๆ ก่อน
    this.editGameForm = this.fb.group({
      game_name: ['', Validators.required],
      description: [''],
      release_date: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      type_ids: this.fb.array([], Validators.required)
    });

    // 2. ดึง ID ของเกมจาก URL
    this.gameId = this.route.snapshot.paramMap.get('id');

    if (this.gameId) {
      this.loadInitialData(this.gameId);
    } else {
      alert('ไม่พบ ID เกม');
      this.router.navigate(['/dashboard']);
    }
  }

  loadInitialData(gameId: string): void {
    // 3. เรียก API 2 ตัวพร้อมกัน: ข้อมูลเกม และ ข้อมูลประเภททั้งหมด
    forkJoin({
      game: this.api.getGameById(gameId),
      types: this.api.getAllTypes()
    }).subscribe({
      next: ({ game, types }) => {
        this.allTypes = types;

        // 4. เติมข้อมูลเกมเดิมลงในฟอร์ม
        this.editGameForm.patchValue({
          game_name: game.game_name,
          description: game.description,
          release_date: this.formatDateForInput(game.release_date),
          price: game.price
        });
        
        // 5. ตั้งค่ารูปภาพเดิม
        this.imagePreview = `http://localhost:3000/uploads/${game.image}`;

        // 6. ตั้งค่า Checkbox ของประเภทเกมเดิม
        const gameTypeIds = game.categories ? game.categories.split(',').map((name: string) => {
            const foundType = this.allTypes.find(t => t.type_name === name.trim());
            return foundType ? foundType.id.toString() : null;
        }).filter((id: string | null) => id !== null) : [];

        this.setInitialTypes(gameTypeIds);

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Failed to load initial data', err);
        alert('ไม่สามารถโหลดข้อมูลเกมได้');
        this.router.navigate(['/dashboard']);
      }
    });
  }
  
  // ฟังก์ชันสำหรับตั้งค่า Checkbox เริ่มต้น
  setInitialTypes(typeIds: string[]): void {
    const typeIdsArray = this.editGameForm.get('type_ids') as FormArray;
    typeIds.forEach(id => typeIdsArray.push(new FormControl(id)));
  }

  // Helper function สำหรับเช็กว่า type นี้ถูกเลือกอยู่หรือไม่
  isChecked(typeId: number): boolean {
    const typeIdsArray = this.editGameForm.get('type_ids') as FormArray;
    return typeIdsArray.value.some((id: string) => id == typeId.toString());
  }
  
  formatDateForInput(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  onTypeChange(event: Event): void {
    const typeIdsArray = this.editGameForm.get('type_ids') as FormArray;
    const target = event.target as HTMLInputElement;
    if (target.checked) {
      typeIdsArray.push(new FormControl(target.value));
    } else {
      const index = typeIdsArray.controls.findIndex(x => x.value === target.value);
      typeIdsArray.removeAt(index);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => { this.imagePreview = reader.result; };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (this.editGameForm.invalid) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    const formData = new FormData();
    formData.append('game_name', this.editGameForm.value.game_name);
    formData.append('price', this.editGameForm.value.price);
    formData.append('description', this.editGameForm.value.description);
    formData.append('release_date', this.editGameForm.value.release_date);

    const typeIds = this.editGameForm.value.type_ids;
    for (const typeId of typeIds) {
      formData.append('type_ids[]', typeId);
    }
    
    if (this.selectedFile) {
      formData.append('file', this.selectedFile, this.selectedFile.name);
    }

    const token = localStorage.getItem('token');
    if (!token || !this.gameId) {
      alert('Session หมดอายุ กรุณาเข้าสู่ระบบใหม่');
      this.router.navigate(['/login']);
      return;
    }

    this.api.updateGame(this.gameId, formData).subscribe({
      next: (response) => {
        alert("✅ บันทึกข้อมูลเกมเรียบร้อยแล้ว!");
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('Update error:', err);
        alert(`เกิดข้อผิดพลาด: ${err.error.error || 'ไม่สามารถบันทึกข้อมูลได้'}`);
      }
    });
  }
}
