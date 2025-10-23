import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  roleName: string | null = null;

  constructor(private authService: AuthService, private translate: TranslateService) {
    this.translate.use(localStorage.getItem('lang') || 'en');
    this.roleName = this.authService.getRoleName();
  }
}
