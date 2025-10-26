import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Api } from '../../../services/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-discount',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './create-discount.html',
  styleUrl: './create-discount.css'
})
export class CreateDiscount implements OnInit, OnDestroy {

  discountForm!: FormGroup;
  isLoading = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  public valueLabel: string = 'มูลค่าส่วนลด (บาท)';
  private apiSub: Subscription | null = null;
  private formSub: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private api: Api
  ) { }
  ngOnInit(): void {
    this.discountForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(4)]],
      discount_type: ['fixed', [Validators.required]],
      discount_value: [null, [Validators.required, Validators.min(1)]],
      max_uses: [100, [Validators.required, Validators.min(1)]],
      expiry_date: [null]
    });

    // [สำคัญ] ดักฟังการเปลี่ยนแปลงของ Dropdown
    this.formSub = this.discountForm.get('discount_type')!.valueChanges.subscribe(type => {
      const valueControl = this.discountForm.get('discount_value');

      if (type === 'percent') {
        this.valueLabel = 'มูลค่าส่วนลด (%)';
        // ถ้าเป็น % ควรกำหนดค่าสูงสุดไว้ที่ 100
        valueControl?.setValidators([Validators.required, Validators.min(1), Validators.max(100)]);
      } else { // 'fixed'
        this.valueLabel = 'มูลค่าส่วนลด (บาท)';
        // เอากลับไปเป็นแบบเดิม (ไม่มี max)
        valueControl?.setValidators([Validators.required, Validators.min(1)]);
      }

      // ล้างค่าเก่าในช่อง "มูลค่า" และอัปเดตการตรวจสอบ
      valueControl?.setValue(null);
      valueControl?.updateValueAndValidity();
    });
  }

  ngOnDestroy(): void {
    // [สำคัญ] ยกเลิก subscription ทั้งหมดเมื่อ component ถูกทำลาย
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    if (this.formSub) {
      this.formSub.unsubscribe();
    }
  }

  onSubmit(): void {
    if (this.discountForm.invalid) {
      // เช็คว่า error เพราะช่อง % เกิน 100 หรือไม่
      if (this.discountForm.get('discount_value')?.errors?.['max']) {
        this.errorMessage = "เปอร์เซ็นต์ต้องไม่เกิน 100";
      } else {
        this.errorMessage = "กรุณากรอกข้อมูลให้ครบถ้วน";
      }
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const payload = this.discountForm.value;

    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }

    this.apiSub = this.api.createDiscountCode(payload).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = `สร้างโค้ด ${payload.code} สำเร็จ! (ID: ${response.id})`;
        this.discountForm.reset({
          discount_type: 'fixed',
          max_uses: 100
        });
        // รีเซ็ต Label กลับไปเป็นค่าเริ่มต้น
        this.valueLabel = 'มูลค่าส่วนลด (บาท)';
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err?.error?.error || 'เกิดข้อผิดพลาด ไม่สามารถสร้างโค้ดได้';
        console.error(err);
      }
    });
  }
}