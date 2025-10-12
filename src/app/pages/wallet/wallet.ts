import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wallet',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './wallet.html',
  styleUrls: ['./wallet.css']
})
export class Wallet implements OnInit {

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

  loadInitialData(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = JSON.parse(userStr);
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
    
    this.apiSubscription = this.api.getWalletBalance(this.currentUser.uid).subscribe({
      next: (data) => {
        this.currentBalance = data.balance;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        // ถ้าไม่เจอ wallet (404) ให้ถือว่ายอดเงินเป็น 0
        if (err.status === 404) {
            this.currentBalance = 0;
        } else {
            this.errorMessage = "ไม่สามารถโหลดข้อมูล Wallet ได้";
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
      user_id: this.currentUser.uid,
      amount: amountToTopup
    };
    
    this.walletForm.disable();

    this.api.topupWallet(payload).subscribe({
      next: (response) => {
        alert(`เติมเงินจำนวน ${amountToTopup} บาท สำเร็จ!`);
        this.walletForm.reset();
        this.walletForm.enable();
        this.fetchWalletBalance(); 
      },
      error: (err) => {
        console.error("Top-up failed:", err);
        alert(`เกิดข้อผิดพลาด: ${err.error.error || 'ไม่สามารถเติมเงินได้'}`);
        this.walletForm.enable();
      }
    });
  }
}
