// src/app/guards/login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
      constructor(private auth: AuthService, private router: Router) { }

      canActivate(): boolean | UrlTree {
            if (this.auth.isLogedIn()) {
                  return this.router.createUrlTree(['/home/dashboard']);
            }
            return true;
      }
}
