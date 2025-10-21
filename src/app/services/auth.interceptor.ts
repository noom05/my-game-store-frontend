// ไฟล์: auth.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // ดึง token จาก localStorage
  const token = localStorage.getItem('token');

  // ถ้ามี token, ให้ clone request แล้วเพิ่ม header
  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  // ถ้าไม่มี token, ส่ง request เดิมออกไป
  return next(req);
};