import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [CommonModule,     // เพื่อให้ *ngIf, *ngFor ใช้งานได้
    RouterModule ],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {

  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  user: any = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // เช็กข้อมูลจาก localStorage ตอนที่ component โหลดขึ้นมา
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      this.isLoggedIn = true;
      this.user = JSON.parse(userStr);
      if (this.user.role === 'admin') {
        this.isAdmin = true;
      }
    } else {
      this.isLoggedIn = false;
    }
  }

  // ฟังก์ชันสำหรับออกจากระบบ
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.isAdmin = false;
    this.router.navigate(['/login']); // กลับไปหน้า login
  }
}
