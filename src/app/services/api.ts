import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private apiUrl = 'http://localhost:3000'; // URL หลักของ Backend

  constructor(private http: HttpClient) {}

  // --- Helper Function: สร้าง Header พร้อม Token ---
  private getAuthHeaders(): HttpHeaders | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('API Service: No token found in local storage.');
      // ส่งค่า null เพื่อให้ฟังก์ชันที่เรียกใช้จัดการต่อ
      return null;
    }
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  // --- ฟังก์ชันสำหรับ User ---
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, credentials);
  }

  register(userData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/register`, userData);
  }

  getUserProfile(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.get<any>(`${this.apiUrl}/user/${id}`, { headers });
  }

  // v----------- เพิ่มฟังก์ชันสำหรับ Wallet และ History -----------v
  getWalletBalance(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('No authorization token found'));
    return this.http.get<any>(`${this.apiUrl}/user/wallet/${userId}`, { headers });
  }

  topupWallet(payload: { user_id: string, amount: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('No authorization token found'));
    return this.http.post<any>(`${this.apiUrl}/user/wallet/topup`, payload, { headers });
  }
  
  getHistory(userId: string): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (!headers) return throwError(() => new Error('No authorization token found'));
    return this.http.get<any[]>(`${this.apiUrl}/user/history/${userId}`, { headers });
  }

  // --- ฟังก์ชันสำหรับ Games ---
  getAllGames(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.get<any[]>(`${this.apiUrl}/games`, { headers });
  }

  getGameById(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.get<any>(`${this.apiUrl}/games/${id}`, { headers });
  }

  createGame(gameData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    // สำหรับ FormData ไม่ต้องตั้ง Content-Type, browser จะจัดการให้เอง
    return this.http.post<any>(`${this.apiUrl}/games`, gameData, {
      headers: headers,
    });
  }

  deleteGameById(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.delete<any>(`${this.apiUrl}/games/${id}`, { headers });
  }

  updateGame(id: string, gameData: FormData): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.put<any>(`${this.apiUrl}/games/${id}`, gameData, {
      headers,
    });
  }

  // --- ฟังก์ชันสำหรับ Types ---
  getAllTypes(): Observable<any[]> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    // Endpoint นี้อยู่ใน games controller ของคุณ
    return this.http.get<any[]>(`${this.apiUrl}/games/types`, { headers });
  }

  
  /**
   * Purchases a game for a user.
   * @param payload An object containing user_id and game_id.
   */
  purchaseGame(payload: { user_id: string; game_id: number }): Observable<any> {
    const headers = this.getAuthHeaders();
    if (!headers)
      return throwError(() => new Error('No authorization token found'));
    return this.http.post<any>(`${this.apiUrl}/user/wallet/purchase`, payload, {
      headers,
    });
  }
}
