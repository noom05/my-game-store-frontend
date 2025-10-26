import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './history.html',
  styleUrls: ['./history.css']
})
export class History implements OnInit {

  currentUser: any = null;
  topupHistory: any[] = [];
  purchaseHistory: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private router: Router,
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadInitialData();
  }

  loadInitialData(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      this.router.navigate(['/login']);
      return;
    }
    this.currentUser = JSON.parse(userStr);
    this.fetchTransactionHistory();
  }

  fetchTransactionHistory(): void {
    if (!this.currentUser?.uid) {
      this.errorMessage = "User ID not found.";
      this.isLoading = false;
      return;
    }

    this.api.getHistory(this.currentUser.uid).subscribe({
      next: (transactions) => {
        // แยกข้อมูลออกเป็น 2 ส่วน
        this.topupHistory = transactions.filter(t => t.type === 'topup');
        this.purchaseHistory = transactions.filter(t => t.type === 'purchase');
        
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "ไม่สามารถโหลดข้อมูลประวัติการทำรายการได้";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}