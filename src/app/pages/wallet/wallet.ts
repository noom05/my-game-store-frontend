import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-wallet',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css'
})
export class Wallet implements OnInit {

  walletForm!: FormGroup;
  // เก็บราคาสำเร็จรูปไว้ใน Array เพื่อให้จัดการง่าย
  presetAmounts: number[] = [20, 50, 100, 300, 500, 1000];

  constructor(private fb: FormBuilder, private router: Router) { }

  ngOnInit(): void {
    // สร้างฟอร์มด้วย FormControl 'amount'
    this.walletForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  // ฟังก์ชันทำงานเมื่อกดปุ่มราคาสำเร็จรูป
  selectAmount(amount: number): void {
    // ใช้ setValue เพื่ออัปเดตค่าในฟอร์ม
    this.walletForm.get('amount')?.setValue(amount);
  }

  // ฟังก์ชันทำงานเมื่อกดปุ่มยืนยัน
  onSubmit(): void {
    if (this.walletForm.invalid) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }
    
    const amount = this.walletForm.value.amount;
    alert(`ยืนยันการทำรายการจำนวน ${amount} บาทเรียบร้อยแล้ว`);
    
    // รีเซ็ตฟอร์มให้กลับเป็นค่าเริ่มต้น
    this.walletForm.reset();
  }
}
