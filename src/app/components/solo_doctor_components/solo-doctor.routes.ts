import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';
import { DashboardGuard } from '../../guards/dashboard.guard';


export const soloDoctorRoutes: Routes = [
      {
            path: 'profile-setup',
            title: 'Profile Setup',
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
                        title: 'Dashboard',
                        loadComponent: () => import('./solo-dashboard/solo-dashboard.component').then(m => m.SoloDashboardComponent)
                  },
                  {
                        path: 'my-profile',
                        title: 'My Profile',
                        loadComponent: () => import('./solo-my-profile/solo-my-profile.component').then(m => m.SoloMyProfileComponent)
                  },
                  {
                        path: 'edit-profile',
                        title: 'Edit Profile',
                        loadComponent: () => import('./solo-edit-profile/solo-edit-profile.component').then(m => m.SoloEditProfileComponent)
                  },
                  {
                        path: 'products',
                        title: 'Products Management',
                        loadComponent: () => import('../clinic_panel_components/product/product-management/product-management.component').then((m) => m.ProductManagementComponent),

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
                  {
                        path: 'appointments',
                        loadComponent: () => import('../appointments/appointments-list/appointments-list.component').then((m) => m.AppointmentsListComponent),
                        title: 'Appointments'
                  },
                  {
                        path: 'appointments/details',
                        loadComponent: () => import('../appointments/appointment-detail/appointment-detail.component').then((m) => m.AppointmentDetailComponent),
                        title: 'Appointment Detail'
                  },
                  {
                        path: 'earning-analytics',
                        loadComponent: () => import('../clinic_panel_components/earning-analytics/earning-analytics.component').then((m) => m.EarningAnalyticsComponent),
                        title: 'Earning & Analytics'
                  },
                  {
                        path: 'ratings-reviews',
                        loadComponent: () => import('../ratings-reviews/ratings-reviews.component').then((m) => m.RatingsReviewsComponent),
                        title: 'Ratings & Reviews'
                  },
                  {
                        path: 'patient-records',
                        loadComponent: () => import('../patient-records/patient-records.component').then((m) => m.PatientRecordsComponent),
                        title: 'Patient Records'
                  },
                  {
                        path: 'support',
                        loadComponent: () => import('../shared/components/tikets-list/tikets-list.component').then((m) => m.TiketsListComponent),
                        title: 'Help & Support'
                  },
                  {
                        path: 'support/raise-ticket',
                        loadComponent: () => import('../shared/components/raise-tickets/raise-tickets.component').then((m) => m.RaiseTicketsComponent),
                        title: 'Help & Support'
                  },
                  {
                        path: 'support/detail',
                        loadComponent: () => import('../shared/components/support-detail/support-detail.component').then((m) => m.SupportDetailComponent),
                        title: 'Help & Support'
                  },
                  {
                        path: 'chat-management',
                        loadComponent: () => import('../doctor_panel_components//chat-management/chat-management.component').then((m) => m.ChatManagementComponent),
                        title: 'Chat Management'
                  },
                  {
                        path: 'change-password',
                        loadComponent: () => import('../change-password/change-password.component').then((m) => m.ChangePasswordComponent),
                        title: 'Change Password'
                  },
                  {
                        path: 'order',
                        loadComponent: () => import('../clinic_panel_components/orders/orders-management/orders-management.component').then((m) => m.OrdersManagementComponent),
                        title: 'Orders Management'
                  },
                  {
                        path: 'order/detail',
                        loadComponent: () => import('../clinic_panel_components/orders/orders-detail/orders-detail.component').then((m) => m.OrdersDetailComponent),
                        title: 'Order Detail'
                  },
                  {
                        path: 'notifications',
                        loadComponent: () => import('../notifications/notifications.component').then((m) => m.NotificationsComponent),
                        title: 'Notifications'
                  },
            ]
      }
];