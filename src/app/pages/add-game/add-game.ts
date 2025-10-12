import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 1. Import ChangeDetectorRef
import { FormBuilder, FormGroup, Validators, FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './add-game.html',
  styleUrls: ['./add-game.css']
})
export class AddGame implements OnInit {
  addGameForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  allTypes: any[] = [];
  isLoading = true; // <<-- เริ่มต้นให้เป็น true

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef // 2. Inject ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.addGameForm = this.fb.group({
      game_name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      release_date: ['', Validators.required],
      type_ids: this.fb.array([], Validators.required)
    });

    this.loadTypes();
  }

  loadTypes(): void {
    this.api.getAllTypes().subscribe({
      next: (types) => {
        this.allTypes = types;
        this.isLoading = false; // <-- ปิด Spinner
        this.cdr.detectChanges(); // 3. บังคับให้อัปเดตหน้าจอ!
      },
      error: (err) => {
        console.error('Failed to load types', err);
        alert('ไม่สามารถโหลดข้อมูลประเภทเกมได้');
        this.isLoading = false; // <-- ปิด Spinner
        this.cdr.detectChanges(); // 3. บังคับให้อัปเดตหน้าจอ!
      }
    });
  }
  
  onTypeChange(event: Event): void {
    const typeIdsArray = this.addGameForm.get('type_ids') as FormArray;
    const target = event.target as HTMLInputElement;

    if (target.checked) {
      typeIdsArray.push(new FormControl(target.value));
    } else {
      const index = typeIdsArray.controls.findIndex(x => x.value === target.value);
      typeIdsArray.removeAt(index);
    }
  }

  isTypeSelected(typeId: number): boolean {
    const typeIdsArray = this.addGameForm.get('type_ids') as FormArray;
    return typeIdsArray.value.some((id: string) => id == typeId.toString());
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
        this.cdr.detectChanges(); // อัปเดตหน้าจอเมื่อมีรูปพรีวิว
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.addGameForm.invalid || !this.selectedFile) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน, เลือกประเภทเกมอย่างน้อย 1 อย่าง, และเลือกรูปภาพ');
      return;
    }
    const formData = new FormData();
    formData.append('game_name', this.addGameForm.value.game_name);
    formData.append('price', this.addGameForm.value.price);
    formData.append('description', this.addGameForm.value.description);
    formData.append('release_date', this.addGameForm.value.release_date);
    
    const typeIds = this.addGameForm.value.type_ids;
    for (const typeId of typeIds) {
      formData.append('type_ids[]', typeId);
    }
    
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('ไม่พบ Token, กรุณาเข้าสู่ระบบใหม่');
      this.router.navigate(['/login']);
      return;
    }

    this.api.createGame(formData).subscribe({
      next: (response) => {
        alert('✅ เพิ่มเกมเรียบร้อยแล้ว!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการเพิ่มเกม:', err);
        alert(`เกิดข้อผิดพลาด: ${err.error.error || 'ไม่สามารถเพิ่มเกมได้'}`);
      }
    });
  }
}

