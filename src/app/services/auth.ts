import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import { Api } from './api'; // Import Api service

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // --- ประกาศสถานะ ---
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private currentUser = new BehaviorSubject<any>(this.getUserFromStorage());

  // --- "คลื่นวิทยุ" ที่ Component อื่นจะมาเปิดฟัง ---
  isLoggedIn$: Observable<boolean> = this.loggedIn.asObservable();
  currentUser$: Observable<any> = this.currentUser.asObservable();

  constructor(private router: Router, private api: Api) {
    // เมื่อผู้ใช้ล็อกอินอยู่ ให้ไปดึงยอดเงินล่าสุดเสมอ
    if (this.loggedIn.value) {
      this.refreshBalance();
    }
  }

  // --- ฟังก์ชันภายใน ---
  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  private getUserFromStorage(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // --- ฟังก์ชันสาธารณะ ---
  login(token: string, user: any): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // ประกาศข่าว: ล็อกอินแล้ว! และนี่คือข้อมูลผู้ใช้!
    this.loggedIn.next(true);
    this.currentUser.next(user); 
    this.refreshBalance(); // ดึงยอดเงินล่าสุดหลังล็อกอิน
    this.router.navigate(['/dashboard']);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // ประกาศข่าว: ล็อกเอาต์แล้ว! และไม่มีผู้ใช้แล้ว!
    this.loggedIn.next(false);
    this.currentUser.next(null);
    this.router.navigate(['/login']);
  }

  // v----------- ฟังก์ชันที่เพิ่มเข้ามา (นี่คือส่วนที่แก้ Error) -----------v
  /**
   * ดึงข้อมูลยอดเงินล่าสุดจาก API
   */
  refreshBalance(): void {
    const user = this.currentUser.value;
    if (user && user.uid) {
      // เรียก API เพื่อขอยอดเงิน
      this.api.getWalletBalance(user.uid).subscribe({
        next: (wallet) => this.updateBalance(wallet.balance),
        error: () => this.updateBalance(0) // ถ้าไม่มี wallet ให้ยอดเงินเป็น 0
      });
    }
  }

  /**
   * อัปเดตยอดเงินในสถานะปัจจุบันและประกาศให้ Component อื่นทราบ
   * @param newBalance ยอดเงินใหม่
   */
  updateBalance(newBalance: number): void {
    const user = this.currentUser.value;
    if (user) {
      // สร้าง object ใหม่พร้อม balance ที่อัปเดต
      const updatedUser = { ...user, balance: newBalance };
      // ประกาศข้อมูลผู้ใช้ที่อัปเดตแล้ว
      this.currentUser.next(updatedUser);
    }
  }
}
