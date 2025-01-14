import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
interface DecodedToken {
  role: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:44300/api/auth'; 
  private roleSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router:Router) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials); 
  }
  
  decodeToken(token: string): any {
    return jwt_decode(token);
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }

  getRole() {
    return this.roleSubject.asObservable();
  }
  getDecodedTokenRole(): string | null {
    const token = localStorage.getItem('token');
  
    // Token boş mu?
    if (!token) {
      console.error('Token bulunamadı.');
      return null;
    }
  
    // Token formatı geçerli mi?
    if (token.split('.').length !== 3) {
      console.error('Token formatı geçersiz.');
      return null;
    }
  
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decodedToken: any = JSON.parse(atob(base64));
  
      // Eğer bir rol varsa, döndür
      return decodedToken.role || null;
    } catch (error) {
      console.error('Token çözümleme hatası:', error);
      return null;
    }
  }
  
  
  
  logout(): void {
    localStorage.removeItem('token');
    this.roleSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }
}
