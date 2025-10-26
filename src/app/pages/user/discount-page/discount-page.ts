import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Api } from '../../../services/api';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-discount-page',
  imports: [CommonModule, HttpClientModule, RouterModule],
  templateUrl: './discount-page.html',
  styleUrl: './discount-page.css',
})
export class DiscountPage implements OnInit {
  codes: any[] = [];
  isLoading = true;
  errorMessage: string | null = null;
  copiedIndex: number | null = null;
  private apiSub: Subscription | null = null;
  private copyTimeout: any = null;

  constructor(private api: Api, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadCodes();
  }

  ngOnDestroy(): void {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
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
        // ✅ กรองเฉพาะโค้ดที่ยังไม่หมดสิทธิ์
        this.codes = data.filter(
          (code: any) => code.current_uses < code.max_uses
        );

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = 'ไม่สามารถโหลดข้อมูลโค้ดได้';
        console.error(err);
        this.cdr.detectChanges();
      },
    });
  }

  copyCode(code: string, index: number): void {
    // ใช้ Clipboard API เพื่อคัดลอกโค้ด
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          this.showCopiedFeedback(index);
        })
        .catch((err) => {
          console.error('ไม่สามารถคัดลอกได้:', err);
          // Fallback method
          this.fallbackCopyToClipboard(code, index);
        });
    } else {
      // Fallback สำหรับ browser เก่า
      this.fallbackCopyToClipboard(code, index);
    }
  }

  private fallbackCopyToClipboard(code: string, index: number): void {
    const textArea = document.createElement('textarea');
    textArea.value = code;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
      this.showCopiedFeedback(index);
    } catch (err) {
      console.error('ไม่สามารถคัดลอกได้:', err);
    }

    document.body.removeChild(textArea);
  }

  private showCopiedFeedback(index: number): void {
    this.copiedIndex = index;
    this.cdr.detectChanges();

    // รีเซ็ตสถานะหลังจาก 2 วินาที
    if (this.copyTimeout) {
      clearTimeout(this.copyTimeout);
    }

    this.copyTimeout = setTimeout(() => {
      this.copiedIndex = null;
      this.cdr.detectChanges();
    }, 2000);
  }
}