import { Component, OnInit } from '@angular/core';
import { LogService } from '../services/log.service';
import { AuthService } from '../services/auth.service';
import * as XLSX from 'xlsx'; // XLSX kütüphanesi
import * as FileSaver from 'file-saver'; // FileSaver kütüphanesi

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
  exportToExcel(): void {
    if (!this.logs || this.logs.length === 0) {
      console.warn("Aktarılacak log verisi bulunamadı.");
      return;
    }
    const dataToExport = this.logs.map(log => ({
      Kullanıcı_ID: log.userId || '',
      Kullanıcı_Eposta: log.userMail || '',
      Durum: log.durum || '',
      İşlem_Tipi: log.islemTip || '',
      Açıklama: log.aciklama || '',
      Tarih: log.tarihSaat ? new Date(log.tarihSaat).toLocaleDateString() : ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Loglar');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, 'Loglar.xlsx');

    console.log('Loglar başarıyla Excel dosyasına aktarıldı.');
  }

  getPages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  logout(): void {
    this.authService.logout();
  }
}
