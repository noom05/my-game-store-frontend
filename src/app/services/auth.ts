import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // เก็บข้อมูลผู้ใช้เป็น BehaviorSubject เพื่อให้ component อัพเดตทันที
  private currentUserSubject = new BehaviorSubject<any>(this.loadUserFromStorage());
  public currentUser$ = this.currentUserSubject.asObservable();

  // isLoggedIn สร้างจาก currentUser เพื่อให้สถานะสอดคล้องเสมอ
  public isLoggedIn$: Observable<boolean> = this.currentUser$.pipe(map(u => !!u));

  constructor(private router: Router) {}

  // อ่าน user จาก localStorage อย่างปลอดภัย
  private loadUserFromStorage(): any {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  // เรียกหลังจาก login สำเร็จ ให้ backend ส่ง token และ user object
  login(token: string, user: any): void {
    if (token) localStorage.setItem('token', token);
    if (user) localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.router.navigate(['/dashboard']);
  }

  // ล็อกเอาต์: เคลียร์ storage และ broadcast ค่า null
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ถ้ามีการเปลี่ยน localStorage จากนอก (เช่น tab อื่น) ให้เรียกฟังก์ชันนี้เพื่อ sync
  updateFromStorage(): void {
    this.currentUserSubject.next(this.loadUserFromStorage());
  }

  // คืนค่า token ปัจจุบัน (ถ้าจำเป็นสำหรับการเรียก API)
  getToken(): string | null {
    return localStorage.getItem('token');
  }
}
