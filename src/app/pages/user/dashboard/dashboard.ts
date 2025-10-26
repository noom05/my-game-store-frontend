import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  allGames: any[] = [];
  filteredGames: any[] = [];
  bestSellerGames: any[] = [];
  gameTypes: { id: number; type_name: string }[] = [];
  selectedType: string = '';

  isLoading: boolean = true;
  errorMessage: string | null = null;

  isLoggedIn: boolean = false;
  isAdmin: boolean = false;

  cartGameIds: number[] = [];

  constructor(
    private api: Api,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkUserStatus();

    // โหลดประเภทเกม
    this.api.getAllTypes().subscribe((types) => {
      this.gameTypes = types;
      this.cdr.detectChanges();
    });
  }

  checkUserStatus(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      this.isLoggedIn = true;
      const user = JSON.parse(userStr);
      this.isAdmin = user.role === 'admin';
      this.loadGames();
      this.loadCart();
    } else {
      this.isLoggedIn = false;
      this.isLoading = false;
    }
  }

  loadGames(): void {
    this.errorMessage = null;

    this.api.getAllGames().subscribe({
      next: (data) => {
        this.allGames = data.map((game) => ({
          ...game,
          imageUrl: `https://games-database-main.onrender.com/uploads/${game.image}`,
          //https://games-database-main.onrender.com/uploads/${game.image}
          types: game.categories
            ? game.categories.split(',').map((t: string) => t.trim())
            : [],
          total_sales: game.total_sales || 0, // ให้แน่ใจว่ามีค่า
        }));

        // ✅ Best Seller 5 อันดับ
        this.bestSellerGames = [...this.allGames]
          .sort((a, b) => b.total_sales - a.total_sales)
          .slice(0, 5);

        this.filteredGames = this.allGames;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('โหลดข้อมูลเกมล้มเหลว:', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้ กรุณาลองใหม่อีกครั้ง';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadCart(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user?.uid) return;

    this.api.getCart(user.uid).subscribe({
      next: (cartItems: any[]) => {
        // TS จะรู้ว่า cartItems เป็น any[]
        this.cartGameIds = cartItems.map((item) => item.id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('โหลดรถเข็นล้มเหลว', err),
    });
  }

  searchGame(keyword: string): void {
    const searchTerm = keyword.trim().toLowerCase();
    this.filteredGames = this.allGames.filter((game) => {
      const matchName = (game.game_name || '')
        .toLowerCase()
        .includes(searchTerm);
      const matchType = this.selectedType
        ? game.types.includes(this.selectedType)
        : true;
      return matchName && matchType;
    });
  }

  filterGames(): void {
    this.searchGame(''); // ใช้ filter type
  }

  addToCart(event: MouseEvent, gameId: number): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.isLoggedIn) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (this.cartGameIds.includes(gameId)) {
      alert('เกมนี้อยู่ในรถเข็นแล้ว');
      return;
    }

    this.api.addToCart({ user_id: user.uid, game_id: gameId }).subscribe({
      next: () => {
        this.cartGameIds.push(gameId);
        alert(
          `เพิ่มเกม "${
            this.allGames.find((g) => g.id === gameId)?.game_name
          }" ลงในตะกร้าแล้ว!`
        );
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('เพิ่มเกมลงรถเข็นล้มเหลว', err);
        alert('ไม่สามารถเพิ่มเกมลงรถเข็นได้');
      },
    });
  }
}