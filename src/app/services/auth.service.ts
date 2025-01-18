import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { LogService } from './log.service';

interface DecodedToken {
  nameid: string; // Kullanıcı ID'si
  role: string;   // Kullanıcı rolü
  email: string;  // Kullanıcı e-posta adresi
  exp: number;    // Token son kullanma zamanı
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:44300/api/auth';
  private roleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router, private logService: LogService) {}

  // Kullanıcı giriş metodu
  login(credentials: { email: string; password: string }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials);
  }

  // Kullanıcı kayıt metodu
  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }

  // Token decode metodu
  private decodeToken(): DecodedToken | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('Token bulunamadı.');
      return null;
    }

    try {
      const decodedToken = jwt_decode<DecodedToken>(token);
      return decodedToken;
    } catch (error) {
      console.error('Token çözümleme hatası:', error);
      return null;
    }
  }

  getDecodedTokenRole(): string | null {
    const decodedToken = this.decodeToken();
    if (decodedToken && decodedToken.role) {
      return decodedToken.role;
    }
    return null;
  }
  
  getDecodedTokenEmail(): string | null {
    const decodedToken = this.decodeToken();
    if (decodedToken && decodedToken.email) {
      return decodedToken.email;
    }
    return null;
  }
  

  // Kullanıcı ID'sini döndürür
  getDecodedTokenUserId(): number | null {
    const decodedToken = this.decodeToken();
    if (!decodedToken || !decodedToken.nameid) {
      console.error('Kullanıcı ID bulunamadı.');
      return null;
    }

    return Number(decodedToken.nameid);
  }

  // Kullanıcı çıkış yapar
  logout(): void {
    localStorage.removeItem('token');
    this.roleSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Kullanıcının giriş yapıp yapmadığını kontrol eder
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
