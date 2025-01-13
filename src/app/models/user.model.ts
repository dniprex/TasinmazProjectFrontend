export interface User {
    id?: number;        // Güncelleme için ID gerekli olabilir
    name: string;       // Kullanıcı adı
    surname: string;    // Kullanıcı soyadı
    email: string;      // E-posta adresi
    password: string;   // Şifre
    userRole: string;   // Kullanıcı rolü (örneğin: Admin, User)
    adres: string;      // Kullanıcı adresi
  }
  