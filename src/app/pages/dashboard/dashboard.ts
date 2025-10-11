import { CommonModule } from '@angular/common';
// 1. Import ChangeDetectorRef เข้ามา
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  allGames: any[] = [];
  filteredGames: any[] = [];
  bestSellerGames: any[] = [];
  isLoading: boolean = true; 
  errorMessage: string | null = null;
  
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  // 2. Inject ChangeDetectorRef เข้ามาใน constructor
  constructor(private api: Api, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.checkUserStatus();
  }
  
  checkUserStatus(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      this.isLoggedIn = true;
      const user = JSON.parse(userStr);
      this.isAdmin = user.role === 'admin';
      this.loadGames(); 
    } else {
      this.isLoggedIn = false;
      this.isLoading = false; 
    }
  }

  loadGames(): void {
    this.errorMessage = null;

    this.api.getAllGames().subscribe({
      next: (data) => {
        if (!Array.isArray(data)) {
            this.errorMessage = 'รูปแบบข้อมูลที่ได้รับจากเซิร์ฟเวอร์ไม่ถูกต้อง';
            this.isLoading = false;
            return;
        }

        this.allGames = data.map(game => ({
          ...game,
          imageUrl: `http://localhost:3000/uploads/${game.image}`
        }));
        
        this.filteredGames = this.allGames;
        this.bestSellerGames = this.allGames.slice(0, 5); 
        this.isLoading = false;

        // 3. "สะกิด" บอก Angular ให้อัปเดตหน้าจอทันที!
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('เกิดข้อผิดพลาดระหว่างโหลดข้อมูลเกม:', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoading = false;

        // "สะกิด" บอก Angular ให้อัปเดตหน้าจอเพื่อแสดง Error
        this.cdr.detectChanges();
      }
    });
  }

  searchGame(keyword: string): void {
    const searchTerm = keyword.trim().toLowerCase();
    if (!searchTerm) {
      this.filteredGames = this.allGames;
      return;
    }
    this.filteredGames = this.allGames.filter(game =>
      (game.game_name || '').toLowerCase().includes(searchTerm)
    );
  }

  addToCart(event: MouseEvent, gameId: number): void {
    event.preventDefault(); 
    event.stopPropagation(); 

    console.log(`กำลังเพิ่มเกม ID: ${gameId} ลงในตะกร้า`);
    alert(`เพิ่มเกม #${gameId} ลงในตะกร้าแล้ว!`);
  }
}

