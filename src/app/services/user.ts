import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class UserService {
  private currentUser = new BehaviorSubject<any>(null);
  currentUser$ = this.currentUser.asObservable();

  setUser(user: any) {
    this.currentUser.next(user);
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearUser() {
    this.currentUser.next(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  }

  getUser(): any {
    return this.currentUser.getValue();
  }

  loadUserFromStorage() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (user) this.setUser(user);
  }
}
