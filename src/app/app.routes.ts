import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';

export const routes: Routes = [
      {
            path: '',
            loadComponent: () => import('./components/auth/login/login.component').then((m) => m.LoginComponent),
            title: 'Login',
            canActivate: [LoginGuard],
            pathMatch: 'full'
      },
      {
            path: 'forgot-password',
            loadComponent: () => import('./components/auth/forget-password/forget-password.component').then((m) => m.ForgetPasswordComponent),
            title: 'Forget Password',
            canActivate: [LoginGuard],
      },
      {
            path: 'unauthorized',
            loadComponent: () => import('./components/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent)
      },
      {
            path: 'clinic',
            loadChildren: () => import('./components/clinic_panel_components/clinic.routes').then(m => m.clinicRoutes)
      },
      {
            path: 'doctor',
            loadChildren: () => import('./components/doctor_panel_components/doctor.routes').then(m => m.doctorRoutes)
      }

];
