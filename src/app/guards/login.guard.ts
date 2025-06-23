// src/app/guards/login.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {
      constructor(private auth: AuthService, private router: Router) { }

      canActivate(): boolean {
            const userData = this.auth.getUserInfo();
            if (this.auth.isLogedIn() && userData.is_onboarded || this.auth.isLogedIn() && userData.on_boarding_status == 4) {
                  const role = this.auth.getRoleName();
                  this.router.navigate([`/${role}`]);
                  return false;
            }
            return true;
      }
}
