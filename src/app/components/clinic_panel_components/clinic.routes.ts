import { Routes } from '@angular/router';
import { AuthGuard } from '../../guards/auth.guard';

export const clinicRoutes: Routes = [
      {
            path: '',
            canActivate: [AuthGuard],
            // data: { roles: ['clinic'] },
            loadComponent: () => import('../clinic_panel_components/clinic/clinic-setup/clinic-setup.component').then(m => m.ClinicSetupComponent)
      },
      {
            path: 'main',
            // canActivate: [AuthGuard],
            data: { roles: ['clinic'] },
            loadComponent: () => import('../main/main.component').then(m => m.MainComponent),
            children: [
                  {
                        path: '',
                        loadComponent: () => import('../clinic_panel_components/dashboard/dashboard.component').then(m => m.DashboardComponent)
                  },
                  {
                        path: 'clinic-profile',
                        loadComponent: () => import('../clinic_panel_components/clinic/clinic-profile/clinic-profile.component').then((m) => m.ClinicProfileComponent),
                        title: 'Clinic Profile',
                  },
                  {
                        path: 'clinic-profile/edit',
                        loadComponent: () => import('../clinic_panel_components/clinic/edit-clinic-profile/edit-clinic-profile.component').then((m) => m.EditClinicProfileComponent),
                        title: 'Edit Clinic Profile'
                  },
                  {
                        path: 'doctors',
                        loadComponent: () => import('../clinic_panel_components/doctors/doctors-management/doctors-management.component').then((m) => m.DoctorsManagementComponent),
                        title: 'Doctors Management'
                  },
                  {
                        path: 'doctors/detail',
                        loadComponent: () => import('../clinic_panel_components/doctors/doctor-detail/doctor-detail.component').then((m) => m.DoctorDetailComponent),
                        title: 'Doctor Detail'
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
                        title: 'Edit Product'
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
                        loadComponent: () => import('../support/tikets-list/tikets-list.component').then((m) => m.TiketsListComponent),
                        title: 'Help & Support'
                  },
                  {
                        path: 'support/raise-ticket',
                        loadComponent: () => import('../support/raise-tickets/raise-tickets.component').then((m) => m.RaiseTicketsComponent),
                        title: 'Help & Support'
                  },
                  {
                        path: 'support/detail',
                        loadComponent: () => import('../support/support-detail/support-detail.component').then((m) => m.SupportDetailComponent),
                        title: 'Help & Support'
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
                  {
                        path: 'my-profile',
                        loadComponent: () => import('../clinic_panel_components/my-profile/my-profile.component').then((m) => m.MyProfileComponent),
                        title: 'My Profile'
                  },
                  {
                        path: 'change-password',
                        loadComponent: () => import('../change-password/change-password.component').then((m) => m.ChangePasswordComponent),
                        title: 'Change Password'
                  },
            ]
      }
];