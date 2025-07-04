import { Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
      providedIn: 'root'
})
export class VerifiedGuard implements CanActivate {
      userId: string = '';
      constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {

      }

      canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
            const id = route.queryParams['id'];

            if (id) {
                  return this.http.post<any>(environment.apiUrl + 'webuser/verifyRoleSelected', { id }).pipe(
                        map(response => {
                              if (!response.success) {
                                    this.router.navigate(['/']);
                                    return false;
                              }
                              return true;
                        }),
                        catchError(() => {
                              return of(true); // or false depending on what you want on error
                        })
                  );
            }

            return of(true);
      }
}