import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HttpClientModule],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.css']
})
export class EditProfile implements OnInit {
  form!: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  previewUrl: string | null = null;

  private token: string | null = null;
  private uid: number | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient
  ) {
    this.form = this.fb.group({
      username: [{ value: '', disabled: true }],
      email: [{ value: '', disabled: true }],
      profileFile: [null as File | null]
    });
  }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    this.token = localStorage.getItem('token');

    if (!userStr || !this.token) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      this.router.navigate(['/login']);
      return;
    }

    const user = JSON.parse(userStr);
    this.uid = user.uid;

    this.form.patchValue({
      username: user.username || '',
      email: user.email || ''
    });

    this.previewUrl = user.profile
      ? `https://games-database-main.onrender.com/uploads/${user.profile}`
      : 'https://placehold.co/140x140?text=No+Image';

    this.fetchLatestProfile();
  }

  onFileSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.form.patchValue({ profileFile: file as File });
    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  private getSelectedFile(): File | null {
    return this.form.get('profileFile')?.value as File | null;
  }

  save(): void {
    if (!this.uid || !this.token) {
      this.errorMessage = 'ข้อมูลผู้ใช้ไม่ครบ';
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const url = `https://games-database-main.onrender.com/user/${this.uid}`;
    const headers = { Authorization: `Bearer ${this.token}` };

    const file = this.getSelectedFile();
    // ส่งข้อมูลที่มีจริง: username/email ถูก readonly อยู่แล้ว แต่ส่งไปเผื่อ backend ต้องการ
    const bodyJson: any = {
      username: this.form.get('username')?.value ?? null,
      email: this.form.get('email')?.value ?? null
    };

    if (file) {
      const fd = new FormData();
      fd.append('file', file); // server expects "file"
      fd.append('username', bodyJson.username ?? '');
      fd.append('email', bodyJson.email ?? '');

      this.http.put<any>(url, fd, { headers: new HttpHeaders(headers), observe: 'response' })
        .subscribe({
          next: resp => this.handleSaveSuccess(resp.body ?? resp),
          error: err => this.handleSaveError(err)
        });
    } else {
      this.http.put<any>(url, bodyJson, { headers: new HttpHeaders(headers), observe: 'response' })
        .subscribe({
          next: resp => this.handleSaveSuccess(resp.body ?? resp),
          error: err => this.handleSaveError(err)
        });
    }
  }

  private handleSaveSuccess(res: any): void {
    const updated = res && res.user ? res.user : res;
    const profileFilename = updated.profile ?? null;
    const imageUrl = profileFilename
      ? `https://games-database-main.onrender.com/uploads/${profileFilename}`
      : this.previewUrl ?? 'https://placehold.co/140x140?text=No+Image';

    const saved = { ...updated, imageUrl };
    localStorage.setItem('user', JSON.stringify(saved));
    this.isSaving = false;
    this.router.navigate(['/profile']);
  }

  private handleSaveError(err: any): void {
    console.error('Save profile error', err);
    this.errorMessage = err?.error?.message || err?.message || 'บันทึกไม่สำเร็จ';
    this.isSaving = false;
  }

  cancel(): void {
    this.router.navigate(['/profile']);
  }

  fetchLatestProfile(): void {
    if (!this.uid || !this.token) return;
    this.isLoading = true;
    this.errorMessage = null;

    const url = `https://games-database-main.onrender.com/user/${this.uid}`;
    const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });

    this.http.get<any>(url, { headers, observe: 'response' }).subscribe({
      next: resp => {
        if (resp.status === 200 && resp.body) {
          const data = resp.body;
          // ตอนนี้ไม่มี realname/displayname จึงไม่ patch ฟิลด์เหล่านั้น
          this.form.patchValue({
            username: data.username || this.form.get('username')?.value,
            email: data.email || this.form.get('email')?.value
          });
          this.previewUrl = data.profile
            ? `https://games-database-main.onrender.com/uploads/${data.profile}`
            : this.previewUrl;
          const merged = { ...data, imageUrl: this.previewUrl };
          localStorage.setItem('user', JSON.stringify(merged));
        }
        this.isLoading = false;
      },
      error: err => {
        console.error('Fetch profile error', err);
        this.errorMessage = err?.message || `โหลดโปรไฟล์ไม่สำเร็จ (status ${err?.status || 'unknown'})`;
        this.isLoading = false;
      }
    });
  }
}
