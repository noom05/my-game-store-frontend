import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ต้องใช้สำหรับ *ngIf
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, // สำหรับ *ngIf, *ngFor
    RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {

  //--- Properties ---
  // ใช้ object เดียวในการเก็บข้อมูลผู้ใช้ทั้งหมด
  userProfile: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  private token: string | null = null;

  //--- Constructor ---
  constructor(private router: Router) { }

  //--- Lifecycle Hooks ---
  ngOnInit(): void {
    // ดึงข้อมูล user และ token จาก localStorage
    const userStr = localStorage.getItem('user');
    this.token = localStorage.getItem('token');

    // ตรวจสอบว่ามีข้อมูลหรือไม่ ถ้าไม่ ให้ redirect ไปหน้า login
    if (!userStr || !this.token) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      this.router.navigate(['/login']);
      return; // หยุดการทำงานของฟังก์ชันทันที
    }
    
    // ถ้ามีข้อมูลครบ ให้เริ่มโหลดโปรไฟล์
    this.userProfile = JSON.parse(userStr);
    this.loadUserProfile();
  }

  //--- Methods ---

  // เมธอดสำหรับโหลดข้อมูลโปรไฟล์ล่าสุดจาก API
  async loadUserProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const res = await fetch(
        `https://games-database-main.onrender.com/user/${this.userProfile.uid}`,
        {
          headers: { Authorization: `Bearer ${this.token}` },
        }
      );

      if (!res.ok) {
        throw new Error("โหลดข้อมูลโปรไฟล์ไม่สำเร็จ");
      }
      
      const data = await res.json();
      
      // อัปเดตข้อมูล userProfile ด้วยข้อมูลล่าสุดจาก API
      this.userProfile = data;

      // สร้าง URL ของรูปภาพโปรไฟล์ให้สมบูรณ์
      if (this.userProfile.profile) {
        this.userProfile.imageUrl = `https://games-database-main.onrender.com/uploads/${this.userProfile.profile}`;
      } else {
        this.userProfile.imageUrl = "https://placehold.co/140x140?text=No+Image";
      }

    } catch (err: any) {
      this.errorMessage = err.message;
      console.error("❌ Error loading user profile:", err);
    } finally {
      // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้หยุดการโหลด
      this.isLoading = false;
    }
  }

  // เมธอดสำหรับออกจากระบบ
  logout(): void {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    this.router.navigate(['/login']);
  }

  // เมธอดสำหรับนำทางไปหน้าแก้ไขโปรไฟล์
  editProfile(): void {
    this.router.navigate(['/edit-profile']);
  }
}
