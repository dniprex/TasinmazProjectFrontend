import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Service global olarak kullanılabilir
})
export class AuthService {
  private apiUrl = 'http://localhost:44300/api/auth'; // Backend'in Auth endpointi

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, { email, password });
  }

  register(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, { email, password });
  }

  logout(): void {
    localStorage.removeItem('token'); // Token'ı localStorage'dan kaldır
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token; // Token varsa kullanıcı oturumu açık
  }
}
