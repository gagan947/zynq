// src/app/guards/login.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
      constructor(private auth: AuthService, private router: Router) { }

      canActivate(): boolean {
            if (this.auth.isLogedIn()) {
                  const role = this.auth.getRoleName();
                  this.router.navigate([`/${role}`]);
                  return false;
            }
            return true;
      }
}
