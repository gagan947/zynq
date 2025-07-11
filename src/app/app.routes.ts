import { Routes } from '@angular/router';
import { LoginGuard } from './guards/login.guard';
import { AuthGuard } from './guards/auth.guard';
import { VerifiedGuard } from './guards/verified.guard';

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
            path: 'set-password',
            loadComponent: () => import('./components/auth/set-password/set-password.component').then((m) => m.SetPasswordComponent),
            title: 'Password Setup',
            data: { roles: ['clinic', 'doctor', 'solo-doctor'] },
            canActivate: [AuthGuard],
      },
      {
            path: 'choose-role',
            title: 'Choose Role',
            loadComponent: () => import('./components/shared/components/choose-role/choose-role.component').then(m => m.ChooseRoleComponent),
            canActivate: [VerifiedGuard]
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
      },
      {
            path: 'solo-doctor',
            loadChildren: () => import('./components/solo_doctor_components/solo-doctor.routes').then(m => m.soloDoctorRoutes)
      },

];
