import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const token = localStorage.getItem('token');

    if (token) {
      const decodedToken: any = JSON.parse(atob(token.split('.')[1])); // JWT çözümü
      const userRole = decodedToken.role;

      if (userRole === expectedRole) {
        return true;
      }
    }

    this.router.navigate(['/ana-menu']); // Yetkisiz erişim için yönlendirme
    return false;
  }
}
