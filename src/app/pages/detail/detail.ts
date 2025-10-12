import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../services/api';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './detail.html',
  styleUrls: ['./detail.css'],
})
export class Detail implements OnInit, OnDestroy {
  game: any = null;
  isAdmin = false;
  gameId: string | null = null;
  isLoading = true;
  errorMessage: string | null = null;

  private apiSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.gameId = this.route.snapshot.paramMap.get('id');
    if (!this.gameId) {
      this.router.navigate(['/dashboard']);
      return;
    }

    this.checkUserRole();
    this.fetchGameData(this.gameId);
  }

  ngOnDestroy(): void {
    this.apiSubscription?.unsubscribe();
  }

  private checkUserRole(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.isAdmin = user?.role === 'admin';
      } catch {
        this.isAdmin = false;
      }
    }
  }

  fetchGameData(id: string): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.apiSubscription = this.api.getGameById(id).subscribe({
      next: (data) => {
        // v----------- จุดที่แก้ไข -----------v
        // แยก categories ที่เป็น string 'Action, RPG' ออกมาเป็น Array ['Action', 'RPG']
        const categoryArray = data.categories ? data.categories.split(',').map((item: string) => item.trim()) : [];
        
        this.game = {
          id: data.id,
          title: data.game_name || 'N/A',
          description: data.description || '',
          releaseDate: this.formatDate(data.release_date),
          genre: categoryArray, // <--- ใช้ Array ที่เราเพิ่งสร้าง
          price: Number(data.price || 0),
          image: this.normalizeImageUrl(data.image)
        };
        // ^----------- สิ้นสุดจุดที่แก้ไข -----------^

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load game details:', err);
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private formatDate(dateStr: string | null): string {
    if (!dateStr) return 'ไม่ระบุ';
    const date = new Date(dateStr);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private normalizeImageUrl(imageFile: string | null): string {
    const placeholder = 'https://placehold.co/600x800/212529/EFEFEF?text=No+Image';
    if (!imageFile) return placeholder;
    return `${this.apiBaseUrl()}/uploads/${imageFile}`;
  }

  private apiBaseUrl(): string {
    return 'http://localhost:3000';
  }

  confirmDelete(): void {
    if (!this.isAdmin || !this.gameId) return;
    if (confirm('คุณแน่ใจว่าต้องการลบเกมนี้ใช่หรือไม่?')) {
      this.api.deleteGameById(this.gameId).subscribe({
        next: () => {
          alert('✅ ลบเกมเรียบร้อยแล้ว');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => alert('เกิดข้อผิดพลาดในการลบเกม'),
      });
    }
  }
}

