import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: 'root' })
export class DashboardGuard implements CanActivate {
      constructor(private auth: AuthService, private router: Router) { }

      canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
            if (!this.auth.isLogedIn()) return this.router.createUrlTree(['/']);
            const allowedRoles = route.data['roles'] as string[];
            const userRole = this.auth.getRoleName();
            const userData = this.auth.getUserInfo();
            if (allowedRoles?.includes(userRole!) && userData.is_onboarded || allowedRoles?.includes(userRole!) && userData.on_boarding_status == 4) return true;

            return this.router.createUrlTree(['/unauthorized']);
      }
}
