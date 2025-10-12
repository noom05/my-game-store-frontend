import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Api } from '../../services/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class Wallet implements OnInit, OnDestroy {

  walletForm!: FormGroup;
  currentUser: any = null;
  currentBalance: number | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  presetAmounts: number[] = [20, 50, 100, 300, 500, 1000];
  private apiSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.walletForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]]
    });

    this.loadInitialData();
  }

  ngOnDestroy(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = null;
    }
  }

  loadInitialData(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    try {
      this.currentUser = JSON.parse(userStr);
    } catch {
      this.currentUser = null;
    }
    if (!this.currentUser) {
      this.router.navigate(['/login']);
      return;
    }
    this.fetchWalletBalance();
  }

  fetchWalletBalance(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (!this.currentUser?.uid) {
        this.errorMessage = "User ID not found.";
        this.isLoading = false;
        return;
    }

    // unsubscribe เก่าแล้วค่อย subscribe ใหม่
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = null;
    }
    
    this.apiSubscription = this.api.getWalletBalance(String(this.currentUser.uid)).subscribe({
      next: (data) => {
        this.currentBalance = data?.balance ?? 0;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err && err.status === 404) {
            this.currentBalance = 0;
        } else {
            this.errorMessage = "ไม่สามารถโหลดข้อมูล Wallet ได้";
            console.error('fetchWalletBalance error:', err);
        }
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  selectAmount(amount: number): void {
    this.walletForm.get('amount')?.setValue(amount);
  }

  onSubmit(): void {
    if (this.walletForm.invalid) {
      alert("กรุณากรอกจำนวนเงินที่ถูกต้อง");
      return;
    }

    const amountToTopup = this.walletForm.value.amount;
    const payload = {
      user_id: String(this.currentUser.uid),
      amount: Number(amountToTopup)
    };
    
    this.walletForm.disable();

    // unsubscribe เก่า ถ้ามี
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = null;
    }

    this.apiSubscription = this.api.topupWallet(payload).subscribe({
      next: (response) => {
        alert(`เติมเงินจำนวน ${payload.amount} บาท สำเร็จ!`);
        this.walletForm.reset();
        this.walletForm.enable();
        this.fetchWalletBalance(); 
      },
      error: (err) => {
        console.error("Top-up failed:", err);
        const errMsg = err?.error?.error || err?.message || 'ไม่สามารถเติมเงินได้';
        alert(`เกิดข้อผิดพลาด: ${errMsg}`);
        this.walletForm.enable();
      }
    });
  }
}
