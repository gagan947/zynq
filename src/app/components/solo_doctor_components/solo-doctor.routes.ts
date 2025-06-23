import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { DashboardGuard } from '../../guards/dashboard.guard';


export const soloDoctorRoutes: Routes = [
      {
            path: 'profile-setup',
            // canActivate: [AuthGuard],
            // data: { roles: ['solo-doctor'] },
            loadComponent: () => import('./solo-profile-setup/solo-profile-setup.component').then(m => m.SoloProfileSetupComponent)
      },
      {
            path: '',
            canActivate: [DashboardGuard],
            data: { roles: ['solo-doctor'] },
            loadComponent: () => import('../main/main.component').then(m => m.MainComponent),
            children: [
                  {
                        path: '',
                        loadComponent: () => import('./solo-dashboard/solo-dashboard.component').then(m => m.SoloDashboardComponent)
                  },
                  {
                        path: 'my-profile',
                        loadComponent: () => import('./solo-my-profile/solo-my-profile.component').then(m => m.SoloMyProfileComponent)
                  },
                  {
                        path: 'edit-profile',
                        loadComponent: () => import('./solo-edit-profile/solo-edit-profile.component').then(m => m.SoloEditProfileComponent)
                  },
                  {
                        path: 'products',
                        loadComponent: () => import('../clinic_panel_components/product/product-management/product-management.component').then((m) => m.ProductManagementComponent),
                        title: 'products Management'
                  },
                  {
                        path: 'products/detail',
                        loadComponent: () => import('../clinic_panel_components/product/view-product/view-product.component').then((m) => m.ViewProductComponent),
                        title: 'Product Detail'
                  },
                  {
                        path: 'products/add',
                        loadComponent: () => import('../clinic_panel_components/product/add-product/add-product.component').then((m) => m.AddProductComponent),
                        title: 'Add Product'
                  },
            ]
      }
];