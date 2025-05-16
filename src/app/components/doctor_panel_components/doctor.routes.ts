import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';


export const doctorRoutes: Routes = [
      {
            path: '',
            canActivate: [AuthGuard],
            data: { roles: ['doctor'] },
            //     children: [
            //       { path: '', component: DashboardComponent },
            //       { path: 'patients', loadComponent: () => import('./patients.component').then(m => m.PatientsComponent) }
            //     ]
      }
];