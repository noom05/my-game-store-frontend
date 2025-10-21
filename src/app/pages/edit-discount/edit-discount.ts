import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Api } from '../../services/api';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-discount',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './edit-discount.html',
  styleUrls: ['./edit-discount.css'],
})
export class EditDiscount implements OnInit, OnDestroy {
  discountForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  codeId: number | null = null;

  public valueLabel: string = 'มูลค่าส่วนลด (บาท)';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private api: Api,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.discountForm = this.fb.group({
      code: [{ value: '', disabled: true }, Validators.required],
      discount_type: ['fixed', Validators.required],
      discount_value: [null, [Validators.required, Validators.min(1)]],
      max_uses: [100, [Validators.required, Validators.min(1)]],
      expiry_date: [null],
      is_active: [true, Validators.required],
    });

    // [แก้ไข] เพิ่ม Logic ดักฟังการเปลี่ยนแปลงของ Dropdown (เหมือนหน้า Create)
    const typeSub = this.discountForm
      .get('discount_type')!
      .valueChanges.subscribe((type) => {
        this.updateValueValidators(type);
      });
    this.subscriptions.push(typeSub);

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.codeId = +idParam;
      this.loadCodeData(this.codeId);
    } else {
      this.errorMessage = 'ไม่พบ ID ของโค้ด';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadCodeData(id: number): void {
    this.isLoading = true;
    const sub = this.api.getDiscountCodeById(id).subscribe({
      next: (data) => {
        if (data.expiry_date) {
          data.expiry_date = formatDate(
            data.expiry_date,
            'yyyy-MM-ddTHH:mm',
            'en-US'
          );
        }
        this.discountForm.patchValue(data);

        // [แก้ไข] ตั้งค่า Label และ Validator ให้ถูกต้องตั้งแต่ตอนโหลดข้อมูล
        this.updateValueValidators(data.discount_type);

        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโค้ดได้';
        this.isLoading = false;
        console.error(err);
      },
    });
    this.subscriptions.push(sub);
  }

  // [แก้ไข] แยก Logic การอัปเดต Validator ออกมาเป็นฟังก์ชัน
  updateValueValidators(type: 'fixed' | 'percent'): void {
    const valueControl = this.discountForm.get('discount_value');

    if (type === 'percent') {
      this.valueLabel = 'มูลค่าส่วนลด (%)';
      valueControl?.setValidators([
        Validators.required,
        Validators.min(1),
        Validators.max(100),
      ]);
    } else {
      // 'fixed'
      this.valueLabel = 'มูลค่าส่วนลด (บาท)';
      valueControl?.setValidators([Validators.required, Validators.min(1)]);
    }
    // อัปเดตเพื่อให้ validation ทำงานทันที
    valueControl?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (this.discountForm.invalid || !this.codeId) {
      // [แก้ไข] เพิ่มการตรวจสอบ Error message ให้ละเอียดขึ้น
      if (this.discountForm.get('discount_value')?.errors?.['max']) {
        this.errorMessage = 'เปอร์เซ็นต์ต้องไม่เกิน 100';
      } else {
        this.errorMessage = 'กรุณากรอกข้อมูลให้ครบถ้วนและถูกต้อง';
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    // เราต้องใช้ getRawValue() เพื่อเอาค่าของ control ที่ disabled (คือช่อง code) มาด้วย
    const payload = this.discountForm.getRawValue();

    const sub = this.api.updateDiscountCode(this.codeId, payload).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = `อัปเดตโค้ดสำเร็จ!`;
        setTimeout(() => {
          this.router.navigate(['/discount-list']);
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage =
          err?.error?.error || 'เกิดข้อผิดพลาด ไม่สามารถอัปเดตโค้ดได้';
        console.error(err);
      },
    });
    this.subscriptions.push(sub);
  }
}
