import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Property } from '../models/property.model';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private apiUrl = 'https://localhost:44330/api';

  constructor(private http: HttpClient) { }

  getProperties(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + "/Tasinmazlar");
  }
  getIller(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/Iller');
  }

  getIlceler(ilId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/Ilceler/by-il/${ilId}`);
  }

  getMahalleler(ilceId: string): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + `/mahalleler/by-ilce/${ilceId}`);
  }
  deleteProperty(id: number): Observable<any> {
    return this.http.delete<any>(this.apiUrl + `/Tasinmazlar/${id}`);
  }
  getPropertyById(id: number): Observable<any> {
    return this.http.get<any>(this.apiUrl + `/Tasinmazlar/${id}`);
  }

  updateProperty(id: number, property: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/Tasinmazlar/${id}`, property);
  }

  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl + '/Auth/users');
  }
  addProperty(property: any): Observable<any> {
    return this.http.post<any>(this.apiUrl + `/Tasinmazlar`, property);
  }
}