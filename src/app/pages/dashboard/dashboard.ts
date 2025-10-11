import { Component, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api'; 

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  allGames: any[] = [];
  filteredGames: any[] = [];
  bestSellerGames: any[] = []; // สำหรับเกม Best Seller

  isLoading = true;
  errorMessage: string | null = null;
  isAdmin = false;

  constructor(private api: Api, private router: Router) { }

  ngOnInit(): void {
    this.checkUserRole();
    this.loadGames();
  }

  checkUserRole(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.isAdmin = user.role === 'admin';
    }
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.api.getAllGames().subscribe({
      next: (data) => {
        // สร้าง URL ของรูปภาพให้ถูกต้อง
        this.allGames = data.map(game => ({
          ...game,
          imageUrl: `http://localhost:3000/uploads/${game.image}`
        }));

        this.filteredGames = this.allGames;
        // (ตัวอย่าง) กรองเกม Best Seller (คุณสามารถเปลี่ยน Logic ได้)
        this.bestSellerGames = this.allGames.slice(0, 5); 
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load games', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
        this.isLoading = false;
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
      game.game_name.toLowerCase().includes(searchTerm)
    );
  }

  addToCart(event: MouseEvent, gameId: any): void {
    event.stopPropagation(); // ป้องกันไม่ให้ link ของ card ทำงาน
    console.log(`Added game ${gameId} to cart!`);
    // ในอนาคตคุณสามารถเพิ่ม Logic การเพิ่มของลงตะกร้าได้ที่นี่
    alert(`เพิ่มเกม ${gameId} ลงตะกร้าแล้ว!`);
  }
}
