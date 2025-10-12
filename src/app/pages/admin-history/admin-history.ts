import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';

@Component({
  selector: 'app-admin-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-history.html',
  styleUrls: ['./admin-history.css']
})
export class AdminHistory implements OnInit {
  
  allTransactions: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(private api: Api, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.fetchAdminHistory();
  }

  fetchAdminHistory(): void {
    this.api.getAdminHistory().subscribe({
      next: (data) => {
        this.allTransactions = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = "ไม่สามารถโหลดข้อมูลประวัติทั้งหมดได้";
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleString('th-TH');
  }
}
