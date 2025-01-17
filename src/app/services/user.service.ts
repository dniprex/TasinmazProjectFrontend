import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://localhost:44330/api';
  constructor(private http: HttpClient) { }
  getUsers(): Observable<any> {
    return this.http.get<any>(this.apiUrl + '/Auth/users');
  }

  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/Auth/${id}`);
  }

  createUser(user: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/Auth/register`, user);
  }
  
  updateUser(id: number, user: Partial<User>): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Auth/users/${id}`, user, { responseType: 'text' });
  }
  updateUsers(id: number, user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Auth/Users/${id}`, user);
  }
  deleteUser(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/Auth/users/${id}`);
  }
  patchUser(id: number, user: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/Auth/users/${id}`, user);
  }
  
}
