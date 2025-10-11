import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  userProfile: any = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private router: Router, private userService: UserService, private cdRef: ChangeDetectorRef) { }

  ngOnInit(): void {
    const user = this.userService.getUser();
    const token = localStorage.getItem('token');

    if (!user || !token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.userProfile = user;
    this.loadUserProfile(user.uid, token);
  }

  async loadUserProfile(uid: string, token: string): Promise<void> {
    this.isLoading = true;
    this.errorMessage = null;

    try {
      const res = await fetch(
        `https://games-database-main.onrender.com/user/${uid}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error('โหลดข้อมูลโปรไฟล์ไม่สำเร็จ');
      }

      const data = await res.json();

      this.userProfile = {
        ...data,
        imageUrl: data.profile
          ? `https://games-database-main.onrender.com/uploads/${data.profile}`
          : 'https://placehold.co/140x140?text=No+Image',
      };

      console.log('📦 userProfile:', this.userProfile);

      // อัปเดตสถานะผู้ใช้ใน UserService ด้วยข้อมูลล่าสุด
      this.userService.setUser(this.userProfile);
    } catch (err: any) {
      this.errorMessage = err.message;
      console.error('❌ Error loading user profile:', err);
    } finally {
      this.isLoading = false;
      console.log(' Done loading');
      this.cdRef.detectChanges();
    }
  }

  editProfile(): void {
    this.router.navigate(['/edit-profile']);
  }
}
