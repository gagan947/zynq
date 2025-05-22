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
            data: { roles: ['doctor'] },
            loadComponent: () => import('../main/main.component').then(m => m.MainComponent),
            children: [
                  {
                        path: '',
                        loadComponent: () => import('../doctor_panel_components/dr-dashboard/dr-dashboard.component').then(m => m.DrDashboardComponent)
                  },
                  {
                        path: 'doctors',
                        loadComponent: () => import('../clinic_panel_components/doctors/doctors-management/doctors-management.component').then((m) => m.DoctorsManagementComponent),
                        title: 'Doctors Management'
                  },
                  {
                        path: 'linked_clinics',
                        loadComponent: () => import('../doctor_panel_components/linked-clinics/linked-clinics.component').then((m) => m.LinkedClinicsComponent),
                        title: 'Clinics'
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
                        loadComponent: () => import('../doctor_panel_components/dr-profile/dr-profile.component').then((m) => m.DrProfileComponent),
                        title: 'My Profile'
                  },
                  {
                        path: 'edit-profile',
                        loadComponent: () => import('../doctor_panel_components/edit-profile/edit-profile.component').then((m) => m.EditProfileComponent),
                        title: 'Edit Profile'
                  },
                  {
                        path: 'chat-management',
                        loadComponent: () => import('../doctor_panel_components//chat-management/chat-management.component').then((m) => m.ChatManagementComponent),
                        title: 'chat-management'
                  },
                  {
                        path: 'change-password',
                        loadComponent: () => import('../change-password/change-password.component').then((m) => m.ChangePasswordComponent),
                        title: 'Change Password'
                  },
            ]
      }
];