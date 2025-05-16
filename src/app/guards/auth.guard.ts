import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from "@angular/router";
import { AuthService } from "../services/auth.service";

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
      constructor(private auth: AuthService, private router: Router) { }

      canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
            if (!this.auth.isLogedIn()) return this.router.createUrlTree(['/']);

            const allowedRoles = route.data['roles'] as string[];
            const userRole = this.auth.getRoleName();

            if (allowedRoles?.includes(userRole!)) return true;

            return this.router.createUrlTree(['/unauthorized']);
      }
}
