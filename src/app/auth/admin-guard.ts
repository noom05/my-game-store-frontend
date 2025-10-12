    import { inject } from '@angular/core';
    import { CanActivateFn, Router } from '@angular/router';
    import { AuthService } from '../services/auth';
    import { map, take } from 'rxjs/operators';

    export const adminGuard: CanActivateFn = (route, state) => {
      const authService = inject(AuthService);
      const router = inject(Router);

      return authService.currentUser$.pipe(
        take(1),
        map(user => {
          if (user && user.role === 'admin') {
            // ถ้าเป็น admin, อนุญาตให้ผ่าน
            return true;
          } else {
            // ถ้าไม่ใช่, ส่งกลับไปหน้า dashboard
            router.navigate(['/dashboard']);
            return false;
          }
        })
      );
    };
    
