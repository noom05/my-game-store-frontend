import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  HttpClient,
  HttpClientModule,
  HttpHeaders
} from '@angular/common/http';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css'],
})
export class EditProfile implements OnInit {
  userProfile: any = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  private token: string | null = null;
  private userFromStorage: any = null;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    this.token = localStorage.getItem('token');

    if (!userStr || !this.token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.userFromStorage = JSON.parse(userStr);
    this.loadUserProfile();
  }

  loadUserProfile(): void {
    const uid = this.userFromStorage?.uid;
    if (!uid) {
      this.errorMessage = 'UID ของผู้ใช้ไม่ถูกต้อง';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;

    const url = `https://games-database-main.onrender.com/user/${uid}`;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    this.http
      .get<any>(url, { headers, observe: 'response' })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (resp) => {
          const data = resp.body;
          if (!data || typeof data !== 'object') {
            this.errorMessage = 'ข้อมูลโปรไฟล์ไม่ถูกต้อง';
            return;
          }
          this.userProfile = data;
          this.userProfile.imageUrl = this.userProfile.profile
            ? `https://games-database-main.onrender.com/uploads/${this.userProfile.profile}`
            : 'https://placehold.co/140x140?text=No+Image';
        },
        error: (err) => {
          this.errorMessage =
            err?.status ? `โหลดข้อมูลโปรไฟล์ไม่สำเร็จ (status ${err.status})` : err?.message || 'โหลดข้อมูลโปรไฟล์ไม่สำเร็จ';
        },
      });
  }

  editProfile(): void {
    if (this.userProfile) {
      this.router.navigate(['/edit-profile', this.userProfile.uid]);
    }
  }
}
