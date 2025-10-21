import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  // --- Data Properties ---
  allGames: any[] = [];
  filteredGames: any[] = [];
  bestSellerGames: any[] = [];
  allTypes: any[] = [];

  isLoading = true; 
  errorMessage: string | null = null;
  isAdmin = false;

  private searchTerm = '';
  public selectedTypeId = 'all';

  constructor(
    private api: Api, 
    private router: Router, 
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.checkUserStatus();
    this.loadInitialData();
  }
  
  checkUserStatus(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.isAdmin = user.role === 'admin';
    }
  }

  loadInitialData(): void {
    this.isLoading = true;
    // ข้อมูลเกม และ ข้อมูลประเภท
    this.api.getAllGames().subscribe({
      next: (games) => {
        this.allGames = games.map(game => ({
          ...game,
          imageUrl: `https://games-database-main.onrender.com/uploads/${game.image}`
        }));
        this.filteredGames = this.allGames;
        this.bestSellerGames = this.allGames.slice(0, 5);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => this.handleError(err)
    });

    this.api.getAllTypes().subscribe({
      next: (types) => {
        this.allTypes = types;
      },
      error: (err) => console.error('Failed to load types', err)
    });
  }

  private handleError(err: any): void {
    console.error('เกิดข้อผิดพลาดระหว่างโหลดข้อมูลเกม:', err);
    this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้ กรุณาลองใหม่อีกครั้ง';
    this.isLoading = false;
    this.cdr.detectChanges();
  }

  private applyFilters(): void {
    let games = this.allGames;

    if (this.selectedTypeId !== 'all') {
      const type = this.allTypes.find(t => t.id.toString() === this.selectedTypeId);
      if (type) {
        games = games.filter(game => 
          game.categories && game.categories.includes(type.type_name)
        );
      }
    }
    if (this.searchTerm) {
      const lowerCaseSearch = this.searchTerm.toLowerCase();
      games = games.filter(game =>
        (game.game_name || '').toLowerCase().includes(lowerCaseSearch)
      );
    }

    this.filteredGames = games;
  }

  searchGame(keyword: string): void {
    this.searchTerm = keyword.trim();
    this.applyFilters();
  }

  filterByType(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedTypeId = selectElement.value;
    this.applyFilters();
  }

  addToCart(event: MouseEvent, gameId: number): void {
    event.preventDefault(); 
    event.stopPropagation(); 
    console.log(`กำลังเพิ่มเกม ID: ${gameId} ลงในตะกร้า`);
    alert(`เพิ่มเกม #${gameId} ลงในตะกร้าแล้ว!`);
  }
}

