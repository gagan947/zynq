import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LoginUserData } from '../../../models/login';
import { LoginComponent } from '../../auth/login/login.component';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  roleName: string | null = null;

  constructor(private authService: AuthService) {
    this.roleName = this.authService.getRoleName();
  }
}
