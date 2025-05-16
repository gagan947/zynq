import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';


export const doctorRoutes: Routes = [
      {
            path: 'profile-setup',
            canActivate: [],
            // data: { roles: ['clinic'] },
            loadComponent: () => import('../doctor_panel_components/profile-setup/profile-setup.component').then(m => m.ProfileSetupComponent)
      },
      {
            path: '',
            canActivate: [AuthGuard],
            data: { roles: ['clinic'] },
            loadComponent: () => import('../main/main.component').then(m => m.MainComponent),
            children: [
                  {
                        path: '',
                        loadComponent: () => import('../clinic_panel_components/dashboard/dashboard.component').then(m => m.DashboardComponent)
                  },
            ]
      }
];