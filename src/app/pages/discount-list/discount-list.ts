import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Api } from '../../services/api';
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-discount-list',
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './discount-list.html',
  styleUrls: ['./discount-list.css']
})
export class DiscountList implements OnInit, OnDestroy {

  codes: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  private apiSub: Subscription | null = null;

  constructor(
    private api: Api,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadCodes();
  }

  ngOnDestroy(): void {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }

  loadCodes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }

    this.apiSub = this.api.getAllDiscountCodes().subscribe({
      next: (data) => {
        this.codes = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "ไม่สามารถโหลดข้อมูลโค้ดได้";
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }

  deleteCode(id: number, code: string): void {
    // ยืนยันก่อนลบ
    if (!confirm(`คุณแน่ใจหรือว่าต้องการลบโค้ด ${code} ?`)) {
      return;
    }

    // (คุณอาจจะอยาก unsubscribe deleteSub ด้วยถ้าคุณต้องการ)
    this.api.deleteDiscountCode(id).subscribe({
      next: () => {
        alert(`ลบโค้ด ${code} สำเร็จ`);
        // โหลดข้อมูลใหม่หลังจากลบสำเร็จ
        this.loadCodes(); 

      },
      error: (err) => {
        alert("เกิดข้อผิดพลาด ไม่สามารถลบโค้ดได้");
        console.error(err);
        this.cdr.detectChanges();
      }
    });
  }
}
