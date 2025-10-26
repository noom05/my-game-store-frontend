import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class Profile implements OnInit {

  userProfile: any = null;
  isLoading = true;
  errorMessage: string | null = null;
  
  private currentUser: any = null;

  constructor(
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = JSON.parse(userStr);
    this.fetchUserProfile();
  }

  fetchUserProfile(): void {
    if (!this.currentUser?.uid) {
      this.errorMessage = "User ID not found.";
      this.isLoading = false;
      return;
    }

    this.api.getUserProfile(this.currentUser.uid).subscribe({
      next: (data) => {
        this.userProfile = {
          ...data,
          imageUrl: this.normalizeImageUrl(data.profile)
        };
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private normalizeImageUrl(imageFile: string | null): string {
    const placeholder = 'https://placehold.co/200x200/EFEFEF/777777?text=Profile';
    if (!imageFile) return placeholder;
    return `https://games-database-main.onrender.com/uploads/${imageFile}`;
  }

  editProfile(): void {
    if (this.userProfile) {
      this.router.navigate(['/edit-profile', this.userProfile.uid]);
    }
  }
}

