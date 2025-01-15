import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class LogService {
  private apiUrl = 'https://localhost:44330/api/Logs';

    constructor(private http: HttpClient) {}

    addLog(log: any): Observable<any> {
      return this.http.post(this.apiUrl, log);
    }
    getLogs(): Observable<any> {
      return this.http.get<any>(this.apiUrl); // API çağrısı
    }
}
