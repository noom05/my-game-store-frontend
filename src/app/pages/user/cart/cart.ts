import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {
  cartItems: any[] = [];
  isLoading = true;
  Amount = 0;
  totalAmount = 0;

  userId: string = ''; // จะเก็บ userId

  // ================= Discount =================
  discountCode: string = '';
  discountValue: number = 0;
  discountType: 'percent' | 'fixed' | '' = '';
  discountMessage: string = '';
  discountApplied = false;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.userId = user.uid;
      this.loadCart(this.userId);
      this.loadDiscountFromStorage(); // ✅ โหลดโค้ดจาก localStorage
    } else {
      this.isLoading = false;
    }
  }

  loadCart(userId: string) {
    this.isLoading = true;
    this.api.getCart(userId).subscribe({
      next: (cartItems: any[]) => {
        this.cartItems = cartItems.map((item) => ({
          game_id: item.id,
          name: item.game_name,
          price: item.price,
          image: item.image,
          quantity: 1,
        }));
        this.updateAmount();
        this.updateTotal();
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('โหลดรถเข็นล้มเหลว', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  updateAmount() {
    const subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    this.Amount = subtotal;
    if (this.Amount < 0) this.Amount = 0;
  }

  updateTotal() {
    let subtotal = this.cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (this.discountApplied) {
      if (this.discountType === 'percent') {
        this.totalAmount = subtotal * (1 - this.discountValue / 100);
      } else if (this.discountType === 'fixed') {
        this.totalAmount = subtotal - this.discountValue;
      }
    } else {
      this.totalAmount = subtotal;
    }

    if (this.totalAmount < 0) this.totalAmount = 0; // ✅ ป้องกันติดลบ
  }

  removeItem(gameId: number) {
    this.api
      .removeFromCart({ user_id: this.userId, game_id: gameId })
      .subscribe({
        next: () => {
          this.cartItems = this.cartItems.filter(
            (item) => item.game_id !== gameId
          );
          this.updateAmount();
          this.updateTotal();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('ลบเกมจากรถเข็นล้มเหลว', err),
      });
  }

  checkout() {
    const payload: any = { user_id: this.userId };
    if (this.discountApplied) payload.discount_code = this.discountCode;

    this.api.checkoutCart(payload).subscribe({
      next: () => {
        alert('ซื้อเกมเรียบร้อยแล้ว!');
        this.cartItems = [];
        this.totalAmount = 0;
        this.discountCode = '';
        this.discountApplied = false;
        this.discountMessage = '';
        this.clearDiscountFromStorage(); // ✅ ล้าง localStorage
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Checkout ล้มเหลว', err);
        alert(err.error?.message || 'ซื้อเกมล้มเหลว');
      },
    });
  }

  // ================= Discount =================
  applyDiscount() {
    this.api
      .applyDiscount({ code: this.discountCode, user_id: this.userId })
      .subscribe({
        next: (res: any) => {
          this.discountType = res.discount_type;
          this.discountValue = res.discount_value;
          this.discountApplied = true;
          this.discountMessage = `ใช้โค้ดสำเร็จ! ลด ${
            this.discountType === 'percent'
              ? this.discountValue + '%'
              : '฿' + this.discountValue
          }`;
          this.updateTotal();
          this.saveDiscountToStorage(); // ✅ บันทึกลง localStorage
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.discountApplied = false;
          this.discountMessage = err.error?.error || 'โค้ดไม่ถูกต้อง';
          this.updateTotal();
          this.cdr.detectChanges();
        },
      });
  }

  // เรียกใช้เวลา component โหลด
  loadDiscountFromStorage() {
    const discountData = localStorage.getItem('cartDiscount');
    if (discountData) {
      const parsed = JSON.parse(discountData);
      this.discountCode = parsed.code;
      this.discountType = parsed.type;
      this.discountValue = parsed.value;
      this.discountApplied = parsed.applied;
    }
  }

  // เรียกใช้เวลา apply สำเร็จ
  saveDiscountToStorage() {
    const discountData = {
      code: this.discountCode,
      type: this.discountType,
      value: this.discountValue,
      applied: this.discountApplied,
    };
    localStorage.setItem('cartDiscount', JSON.stringify(discountData));
  }

  // เรียกใช้เวลา checkout สำเร็จ
  clearDiscountFromStorage() {
    localStorage.removeItem('cartDiscount');
  }
}