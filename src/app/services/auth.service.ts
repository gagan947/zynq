import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {

      setValues(token: string, roleUUID: string,userInfo: any) {
            localStorage.setItem('ZynqToken', token)
            localStorage.setItem('role_uuid', roleUUID);
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
      }

      getToken() {
            return localStorage.getItem('ZynqToken')
      }

      isLogedIn() {
            return this.getToken() !== null
      }

      logout(): void {
            localStorage.removeItem('role_uuid');
            localStorage.removeItem('ZynqToken');
            localStorage.removeItem('userInfo');
            
      };

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