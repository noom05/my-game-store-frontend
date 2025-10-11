import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

// Mock Data: ในโปรเจกต์จริง ข้อมูลนี้ควรมาจาก Service ที่เรียก API
const GAMES_DATA: { [key: string]: any } = {
  fc26: {
    title: 'EA SPORTS FC™ 26 ULTIMATE EDITION',
    description: `ครอบคลุมที่สุดกับประสบการณ์การเล่น EA SPORTS FC™ 26...`,
    releaseDate: '26 กันยายน 2025',
    stock: 4,
    genre: 'กีฬา / ฟุตบอล',
    price: 1999,
    image: '/assets/fc26.jpg',
  },
  battlefield: {
    title: 'Battlefield 2042',
    description:
      'เกมยิงสุดมันส์ในสนามรบแห่งอนาคต พร้อมโหมดผู้เล่นหลายคนที่เข้มข้น',
    releaseDate: '15 พฤศจิกายน 2023',
    stock: 12,
    genre: 'ยิง / แอคชั่น',
    price: 1050,
    image: '/assets/battlefield.jpg',
  },
};

@Component({
  selector: 'app-detail',
  imports: [CommonModule, RouterModule],
  templateUrl: './detail.html',
  styleUrl: './detail.css',
})
export class Detail implements OnInit {
  game: any = null;
  isAdmin: boolean = false;
  gameId: string | null = null;

  constructor(
    private route: ActivatedRoute, // Service สำหรับดึงข้อมูลจาก URL
    private router: Router
  ) {}

  ngOnInit(): void {
    // 1. ดึง ID ของเกมจาก URL (เช่น /detail/fc26)
    const gameId = this.route.snapshot.paramMap.get('id');

    if (gameId) {
      // 2. ค้นหาข้อมูลเกมจาก ID ที่ได้มา
      this.game = GAMES_DATA[gameId];
    }

    // 3. ถ้าไม่พบข้อมูลเกม ให้ redirect กลับไปหน้า dashboard
    if (!this.game) {
      alert('ไม่พบข้อมูลเกมนี้');
      this.router.navigate(['/dashboard']);
      return;
    }

    // 4. เช็ก role ของผู้ใช้จาก localStorage เพื่อแสดงปุ่มที่ถูกต้อง
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user && user.role === 'admin') {
        this.isAdmin = true;
      }
    }
  }

  // ฟังก์ชันสำหรับยืนยันการลบเกม
  confirmDelete(): void {
    if (confirm('คุณแน่ใจว่าต้องการลบเกมนี้ใช่หรือไม่?')) {
      // ในโปรเจกต์จริง ส่วนนี้จะเป็นการเรียก API เพื่อลบข้อมูล
      alert('✅ ลบเกมเรียบร้อยแล้ว');
      this.router.navigate(['/dashboard']);
    }
  }
}
