import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Api {

  private apiUrl = 'http://localhost:3000'; 

  constructor(private http: HttpClient) { }

  // --- ฟังก์ชันสำหรับ User Authentication ---

  /**
   * ส่งข้อมูลเพื่อสมัครสมาชิก
   * @param userData FormData ที่มี username, email, password, และ file (รูปโปรไฟล์)
   */
  register(userData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/register`, userData);
  }

  /**
   * ส่งข้อมูลเพื่อเข้าสู่ระบบ
   * @param credentials Object ที่มี username และ password
   */
  login(credentials: {username: string, password: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/user/login`, credentials);
  }

  /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้
   * @param uid ID ของผู้ใช้
   * @param token JWT Token สำหรับ Authorization
   */
  getUserProfile(uid: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<any>(`${this.apiUrl}/user/${uid}`, { headers: headers });
  }


  // --- ฟังก์ชันสำหรับ Games ---

  /**
   * ดึงข้อมูลเกมทั้งหมด
   */
  getAllGames(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/games`);
  }

  /**
   * ดึงข้อมูลเกมชิ้นเดียวตาม ID
   * @param id ID ของเกม
   */
  getGameById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/games/${id}`);
  }

  /**
   * เพิ่มเกมใหม่
   * @param gameData FormData ที่มีข้อมูลเกม, รูปภาพ, และ type_ids
   * @param token JWT Token สำหรับ Authorization
   */
  createGame(gameData: FormData, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.post<any>(`${this.apiUrl}/games`, gameData, { headers: headers });
  }
  
  /**
   * ลบเกมตาม ID
   * @param id ID ของเกมที่จะลบ
   * @param token JWT Token สำหรับ Authorization
   */
  deleteGame(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.delete<any>(`${this.apiUrl}/games/${id}`, { headers: headers });
  }


  // --- ฟังก์ชันสำหรับ Types ---
  
  /**
   * ดึงข้อมูลประเภทเกมทั้งหมด
   */
  getAllTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/types`);
  }
}

