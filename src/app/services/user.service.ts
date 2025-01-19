import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:44330/api';
  constructor(private http: HttpClient) { }
  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/users`);
  }
  
  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user/${id}`);
  }
  
  createUser(user: any): Observable<any> {
    console.log('API\'ye gönderilen veri:', user);
    return this.http.post<any>(`${this.apiUrl}/user/register`, user);
  }
  updateUser(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/user/${id}`, user);
  }
  
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/user/${id}`);
  }
  
  
}
