import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  user: any = null;

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    // โหลดสถานะผู้ใช้จาก localStorage (ครั้งแรก)
    this.userService.loadUserFromStorage();

    // Subscribe เพื่อรับการเปลี่ยนแปลงแบบ real-time
    this.userService.currentUser$.subscribe(user => {
      this.user = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  logout(): void {
    this.userService.clearUser();
    this.router.navigate(['/login']);
  }
}
