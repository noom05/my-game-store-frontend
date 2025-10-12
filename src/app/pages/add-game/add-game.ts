import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-game',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './add-game.html',
  styleUrls: ['./add-game.css'],
})
export class AddGame implements OnInit {
  addGameForm!: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  allTypes: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.addGameForm = this.fb.group({
      game_name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      release_date: ['', Validators.required],
      type_ids: this.fb.array([], Validators.required),
    });

    this.loadTypes();
  }

  loadTypes(): void {
    console.log('calling getAllTypes()');
    this.api.getAllTypes().subscribe({
      next: (types: any[]) => {
        console.log('types raw:', types);
        // ใช้ spread เพื่อกระตุ้น change detection และให้โครงสร้างชัวร์
        this.allTypes = [
          ...types
            .map((t) => ({
              id: t.id ?? t.ID ?? t.type_id,
              type_name: t.type_name ?? t.typeName ?? t.Az_type_name ?? t.name,
            }))
            .filter((t) => t.id !== undefined && t.type_name !== undefined),
        ];
        console.log('allTypes set:', this.allTypes);
        // บังคับ angular update
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load types', err);
        alert('ไม่สามารถโหลดข้อมูลประเภทเกมได้');
      },
    });
  }

  // helper ที่ template ใช้เพื่อตรวจว่า type ถูกเลือกหรือไม่
  isTypeSelected(typeId: number): boolean {
    const arr = this.addGameForm.get('type_ids') as FormArray;
    return arr.value.includes(typeId);
  }

  onTypeToggle(event: Event, typeId: number): void {
    const checked = (event.target as HTMLInputElement).checked;
    const arr = this.addGameForm.get('type_ids') as FormArray;
    if (checked) {
      if (!arr.value.includes(typeId)) arr.push(new FormControl(typeId));
    } else {
      const idx = arr.controls.findIndex((c) => c.value === typeId);
      if (idx !== -1) arr.removeAt(idx);
    }
    console.log('type_ids now:', arr.value);
  }

  onTypeChange(event: Event): void {
    const typeIdsArray = this.addGameForm.get('type_ids') as FormArray;
    const target = event.target as HTMLInputElement;
    const valueNum = Number(target.value);

    console.log('onTypeChange value:', valueNum, 'checked:', target.checked);

    if (target.checked) {
      if (!typeIdsArray.controls.some((c) => c.value === valueNum)) {
        typeIdsArray.push(new FormControl(valueNum));
      }
    } else {
      const index = typeIdsArray.controls.findIndex(
        (x) => x.value === valueNum
      );
      if (index !== -1) {
        typeIdsArray.removeAt(index);
      }
    }
    console.log('type_ids now:', typeIdsArray.value);
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    console.log(
      'onSubmit called, form valid:',
      this.addGameForm.valid,
      'selectedFile:',
      !!this.selectedFile
    );
    if (this.addGameForm.invalid || !this.selectedFile) {
      alert(
        'กรุณากรอกข้อมูลให้ครบถ้วน, เลือกประเภทเกมอย่างน้อย 1 อย่าง, และเลือกรูปภาพ'
      );
      return;
    }

    const formData = new FormData();
    formData.append('game_name', this.addGameForm.value.game_name);
    formData.append('price', String(this.addGameForm.value.price));
    formData.append('description', this.addGameForm.value.description);
    formData.append('release_date', this.addGameForm.value.release_date);

    const typeIds: number[] = this.addGameForm.value.type_ids || [];
    for (const typeId of typeIds) {
      formData.append('type_ids[]', String(typeId));
    }

    formData.append('file', this.selectedFile, this.selectedFile.name);

    const token = localStorage.getItem('token');
    if (!token) {
      alert('ไม่พบ Token, กรุณาเข้าสู่ระบบใหม่');
      this.router.navigate(['/login']);
      return;
    }

    this.api.createGame(formData, token).subscribe({
      next: (response) => {
        alert('✅ เพิ่มเกมเรียบร้อยแล้ว!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดในการเพิ่มเกม:', err);
        alert(`เกิดข้อผิดพลาด: ${err.error?.error || 'ไม่สามารถเพิ่มเกมได้'}`);
      },
    });
  }
}
