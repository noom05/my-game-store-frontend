import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { UserService } from '../../../services/user';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './library.html',
  styleUrls: ['./library.css'],
})
export class Library implements OnInit {
  apiUrl = environment.apiUrl;
  purchasedGames: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // โหลด user จาก localStorage
    this.userService.loadUserFromStorage();

    // subscribe user
    this.userService.currentUser$.subscribe((user) => {
      if (!user) {
        this.purchasedGames = [];
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.isLoading = true;
      this.http
        .get<any[]>(`https://games-database-main.onrender.com/user/library/${user.uid}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .subscribe({
          next: (res) => {
            this.purchasedGames = res || [];
            this.isLoading = false;
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('โหลดคลังเกมล้มเหลว:', err);
            this.errorMessage = 'ไม่สามารถโหลดคลังเกมได้';
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
    });
  }

  formatPrice(price: number) {
    return (
      price?.toLocaleString('th-TH', { style: 'currency', currency: 'THB' }) ||
      '-'
    );
  }
}