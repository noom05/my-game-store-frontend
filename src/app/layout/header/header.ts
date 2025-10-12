import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [ CommonModule, RouterModule ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header {
  public isAdmin$: Observable<boolean>;
  public isLoggedIn$: Observable<boolean>;

  constructor(
    public authService: AuthService,
    private router: Router
  ) {
    // expose Observable ตรงจาก service ให้ template ใช้ได้ทันที
    this.isLoggedIn$ = this.authService.isLoggedIn$;
    this.isAdmin$ = this.authService.currentUser$.pipe(
      map(user => user?.role === 'admin')
    );
  }

  logout(): void {
    this.authService.logout();
    // นำทางไปหน้า login/หน้าหลักหลัง logout
    this.router.navigate(['/login']);
  }
}
