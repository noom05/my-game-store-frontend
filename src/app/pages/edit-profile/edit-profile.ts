import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  imports: [CommonModule, RouterModule],
  templateUrl: './edit-profile.html',
  styleUrl: './edit-profile.css'
})
export class EditProfile implements OnInit {

  userProfile: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  
  private token: string | null = null;
  private userFromStorage: any = null;

  constructor(private router: Router) { }

  ngOnInit(): void {
    // 1. ดึงข้อมูล user และ token จาก localStorage
    const userStr = localStorage.getItem('user');
    this.token = localStorage.getItem('token');

    // 2. ตรวจสอบว่ามีข้อมูลหรือไม่ ถ้าไม่ ให้ redirect ไปหน้า login
    if (!userStr || !this.token) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      this.router.navigate(['/login']);
      return; 
    }
    
    // 3. ถ้ามีข้อมูลครบ ให้เริ่มโหลดโปรไฟล์
    this.userFromStorage = JSON.parse(userStr);
    this.loadUserProfile();
  }

  // เมธอดสำหรับโหลดข้อมูลโปรไฟล์ล่าสุดจาก API
  async loadUserProfile(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const res = await fetch(
        `https://games-database-main.onrender.com/user/${this.userFromStorage.uid}`,
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
      this.isLoading = false;
    }
  }
  
  // เมธอดสำหรับนำทางไปหน้าแก้ไขโปรไฟล์
  editProfile(): void {
    if (this.userProfile) {
      // ส่ง uid ไปกับ URL
      this.router.navigate(['/edit-profile', this.userProfile.uid]);
    }
  }
}
