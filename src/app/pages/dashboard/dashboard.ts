import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';;

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class Dashboard implements OnInit {

  // 1. สร้าง Properties เพื่อควบคุมการแสดงผลใน HTML
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  user: any = null;

  // ตัวแปรสำหรับเก็บเกม (ในโปรเจกต์จริง ข้อมูลนี้ควรมาจาก API)
  allGames: any[] = [
    { id: 'bf2042', title: 'Battlefield 2042', price: 1050.00, image: '/assets/battlefield.jpg', bestSeller: true },
    { id: 'fc26', title: 'FC 26', price: 1990.00, image: '/assets/fc26.jpg' }
    // ... เพิ่มเกมอื่นๆ ที่นี่
  ];
  filteredGames: any[] = []; // ตัวแปรสำหรับเก็บเกมที่ผ่านการค้นหา

  constructor(private router: Router) { }

  // 2. Logic ทั้งหมดจะเริ่มทำงานใน ngOnInit
  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (userStr && token) {
      this.isLoggedIn = true;
      this.user = JSON.parse(userStr);
      if (this.user.role === 'admin') {
        this.isAdmin = true;
      }
    } else {
      this.isLoggedIn = false;
      this.isAdmin = false;
    }

    // ตอนเริ่มต้น ให้แสดงเกมทั้งหมด
    this.filteredGames = this.allGames;
  }

  // 3. สร้างฟังก์ชัน searchGame และ logout เป็นเมธอด
  searchGame(keyword: string): void {
    const searchTerm = keyword.trim().toLowerCase();
    if (!searchTerm) {
      this.filteredGames = this.allGames; // ถ้าช่องค้นหาว่าง ให้แสดงเกมทั้งหมด
      return;
    }

    this.filteredGames = this.allGames.filter(game =>
      game.title.toLowerCase().includes(searchTerm)
    );

    if (this.filteredGames.length === 0) {
      alert('ไม่พบเกมที่คุณค้นหา');
    }
  }

  logout(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.router.navigate(['/login']); // กลับไปหน้า login
  }
}
