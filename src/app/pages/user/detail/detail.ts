import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Api } from '../../../services/api';
import { AuthService } from '../../../services/auth';
import { Subscription, take } from 'rxjs';

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
  isPurchasing = false;
  hasPurchased: boolean = false;
  isInCart: boolean = false;

  private apiSubscription: Subscription | null = null;
  private currentUser: any = null;
  private cartGameIds: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      this.currentUser = JSON.parse(userStr);
    }

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

    const userId = this.currentUser?.uid;
    if (!userId) {
      this.errorMessage = 'กรุณาเข้าสู่ระบบเพื่อดูรายละเอียดเกม';
      this.isLoading = false;
      return;
    }

    this.apiSubscription = this.api
      .getGameDetailWithRankAndPurchase(id ?? '', String(userId))
      .subscribe({
        next: (data) => {
          const categoryArray = data.game.categories
            ? data.game.categories.split(',').map((item: string) => item.trim())
            : [];

          this.game = {
            id: data.game.id,
            title: data.game.game_name,
            description: data.game.description,
            releaseDate: this.formatDate(data.game.release_date),
            genre: categoryArray,
            price: Number(data.game.price),
            image: this.normalizeImageUrl(data.game.image),
            bestsale: data.game.total_sales,
            rank: data.rank ?? null, // ✅ เพิ่มตรงนี้
          };

          this.hasPurchased = data.isPurchased;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Failed to load game details:', err);
          this.errorMessage = 'ไม่สามารถโหลดข้อมูลเกมได้';
          this.isLoading = false;
          this.cdr.detectChanges();
        },
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
    const placeholder =
      'https://placehold.co/600x800/212529/EFEFEF?text=No+Image';
    if (!imageFile) return placeholder;
    return `${this.apiBaseUrl()}/uploads/${imageFile}`;
  }

  private apiBaseUrl(): string {
    return 'http://games-database-main.onrender.com';
  }

  confirmDelete(): void {
    if (!this.isAdmin || !this.gameId) return;
    if (confirm('คุณแน่ใจว่าต้องการลบเกมนี้ใช่หรือไม่?')) {
      this.api.deleteGameById(this.gameId).subscribe({
        next: () => {
          alert('ลบเกมเรียบร้อยแล้ว');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => alert('เกิดข้อผิดพลาดในการลบเกม'),
      });
    }
  }

  purchaseGame(): void {
    if (!this.currentUser || !this.game) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.authService.currentUser$
      .pipe(take(1))
      .subscribe((currentUserWithBalance) => {
        const userBalance = currentUserWithBalance?.balance ?? 0;

        if (userBalance < this.game.price) {
          if (
            confirm('ยอดเงินของคุณไม่เพียงพอ ต้องการไปที่หน้าเติมเงินหรือไม่?')
          ) {
            this.router.navigate(['/wallet']);
          }
          return;
        }

        if (
          !confirm(
            `คุณต้องการซื้อเกม "${this.game.title}" ในราคา ${this.game.price} บาท หรือไม่?`
          )
        ) {
          return;
        }

        this.isPurchasing = true;
        this.cdr.detectChanges();

        const payload = {
          user_id: this.currentUser.uid,
          game_id: this.game.id,
        };

        this.api.purchaseGame(payload).subscribe({
          next: (response) => {
            alert(` ซื้อเกม "${this.game.title}" สำเร็จ!`);
            this.authService.updateBalance(response.balance);
            this.isPurchasing = false;
            this.router.navigate(['/history']);
          },
          error: (err) => {
            console.error('Purchase failed:', err);
            this.isPurchasing = false;
            const errorMessage = err.error?.error || 'ไม่สามารถซื้อเกมได้';

            if (errorMessage.toLowerCase().includes('not enough balance')) {
              if (
                confirm(
                  'ยอดเงินของคุณไม่เพียงพอ ต้องการไปที่หน้าเติมเงินหรือไม่?'
                )
              ) {
                this.router.navigate(['/wallet']);
              }
            } else {
              alert(`เกิดข้อผิดพลาด: ${errorMessage}`);
            }
            this.cdr.detectChanges(); // สั่งให้อัปเดตหน้าเว็บเมื่อเกิด Error
          },
        });
      });
  }

  addToCartAndGo(): void {
    if (!this.currentUser || !this.game) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    this.isPurchasing = true;
    this.cdr.detectChanges();

    const payload = {
      user_id: this.currentUser.uid,
      game_id: this.game.id,
    };

    this.api.addToCart(payload).subscribe({
      next: () => {
        alert(`เพิ่มเกม "${this.game.title}" ลงในตะกร้าเรียบร้อยแล้ว!`);
        this.isPurchasing = false;
        this.router.navigate(['/cart']); // ✅ ไปหน้ารถเข็น
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('เพิ่มเกมลงรถเข็นล้มเหลว:', err);
        alert('ไม่สามารถเพิ่มเกมลงรถเข็นได้');
        this.isPurchasing = false;
        this.cdr.detectChanges();
      },
    });
  }

  addToCart(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const userData = localStorage.getItem('user');
    if (!userData) {
      alert('กรุณาเข้าสู่ระบบก่อนทำรายการ');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userData);

    // ✅ ตรวจสอบว่าซื้อแล้วหรือยัง
    if (this.hasPurchased) {
      alert('คุณได้ซื้อเกมนี้แล้ว');
      return;
    }

    // ✅ เพิ่มเกมลงรถเข็นโดยตรง (ไม่ต้องใช้ allGames หรือ cartGameIds)
    const payload = {
      user_id: user.uid,
      game_id: this.game.id,
    };

    this.isPurchasing = true;
    this.cdr.detectChanges();

    this.api.addToCart(payload).subscribe({
      next: () => {
        alert(`เพิ่มเกม "${this.game.title}" ลงในตะกร้าเรียบร้อยแล้ว!`);
        this.isPurchasing = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('เพิ่มเกมลงรถเข็นล้มเหลว:', err);
        alert('ไม่สามารถเพิ่มเกมลงรถเข็นได้');
        this.isPurchasing = false;
        this.cdr.detectChanges();
      },
    });
  }
}
