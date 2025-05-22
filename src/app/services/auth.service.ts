import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
      constructor(private router: Router) { }

      setToken(token: string, roleUUID: string) {
            localStorage.setItem('ZynqToken', token)
            localStorage.setItem('role_uuid', roleUUID);
      }

      getToken() {
            return localStorage.getItem('ZynqToken')
      }

      isLogedIn() {
            return this.getToken() !== null
      }

      logout(): void {
            localStorage.clear();
            this.router.navigate(['/']);
      }

      getRoleUUID(): string | null {
            return localStorage.getItem('role_uuid');
      }

      private readonly roleMap: { [key: string]: string } = {
            '2fc0b43c-3196-11f0-9e07-0e8e5d906eef': 'clinic',
            '3677a3e6-3196-11f0-9e07-0e8e5d906eef': 'doctor',
      };

      getRoleName(): string | null {
            const roleUUID = this.getRoleUUID();
            return roleUUID ? this.roleMap[roleUUID] || null : null;
      }

}