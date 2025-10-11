    import { Injectable } from '@angular/core';
    import { HttpClient, HttpHeaders } from '@angular/common/http';
    import { Observable } from 'rxjs';

    @Injectable({
      providedIn: 'root'
    })
    export class Api {
      private apiUrl = 'http://localhost:3000';

      constructor(private http: HttpClient) { }

      // --- ฟังก์ชันสำหรับ User ---
      login(credentials: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/user/login`, credentials);
      }

      register(data: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/user/register`, data);
      }

      // --- ฟังก์ชันสำหรับ Games ---
      getAllGames(): Observable<any[]> {
        const token = localStorage.getItem('token');
        if (!token) {
          return new Observable(observer => {
            observer.error('No token found in local storage');
          });
        }
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });

        // เพิ่ม timestamp ที่ไม่ซ้ำกันต่อท้าย URL เพื่อบังคับให้โหลดใหม่เสมอ
        const timestamp = new Date().getTime();
        return this.http.get<any[]>(`${this.apiUrl}/games?t=${timestamp}`, { headers: headers });
      }
      
      // --- ฟังก์ชันสำหรับ Types ---
      getAllTypes(): Observable<any[]> {
        const token = localStorage.getItem('token');
         if (!token) {
          return new Observable(observer => observer.error('No token found'));
        }
        const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
        return this.http.get<any[]>(`${this.apiUrl}/types`, { headers });
      }

      // --- ฟังก์ชันอื่นๆ ---
      createGame(gameData: FormData, token: string): Observable<any> {
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
        return this.http.post<any>(`${this.apiUrl}/games`, gameData, { headers: headers });
      }
    }
    

