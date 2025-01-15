import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/log.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css']
})
export class LogComponent implements OnInit {
  logs: any[] = [];
  pagedLogs: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;

  constructor(private logService: LogService, private authService: AuthService) { }

  ngOnInit(): void {
    this.getLogs();
  }

  getLogs(): void {
    this.logService.getLogs().subscribe((data) => {
      this.logs = data;
      console.log("API'den Gelen Veriler:", this.logs);
      this.totalPages = Math.ceil(this.logs.length / this.pageSize);
      this.updatePagedLogs();
    });
  }
  updatePagedLogs(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedLogs = this.logs.slice(startIndex, endIndex);
    console.log("Sayfada Gösterilen Loglar:", this.pagedLogs);
  }

  onPageChange(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagedLogs();
    }
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  logout(): void {
    this.authService.logout();
  }
}
