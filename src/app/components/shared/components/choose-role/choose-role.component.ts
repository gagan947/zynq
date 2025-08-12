import { Component } from '@angular/core';
import { CommonService } from '../../../../services/common.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-choose-role',
  standalone: true,
  imports: [],
  templateUrl: './choose-role.component.html',
  styleUrl: './choose-role.component.css'
})
export class ChooseRoleComponent {
  selectedRole: string = '';
  selectedRoleId: string = '';
  userId: string = '';
  loading: boolean = false
  constructor(private service: CommonService, private route: ActivatedRoute, private router: Router) {
    this.route.queryParams.subscribe(param => {
      this.userId = param['id'];
    })
    localStorage.clear()
  }

  selectRole(role: string, roleId: string) {
    this.selectedRole = role;
    this.selectedRoleId = roleId;
  }

  confirmRole() {
    this.loading = true
    let formData = {
      id: this.userId,
      role_id: this.selectedRoleId
    }
    this.service.post('webuser/onboarding-by-role-id', formData).subscribe((res: any) => {
      if (res.success) {
        this.router.navigate(['/']);
        this.loading = false
      }
    },
      (err: any) => {
        this.loading = false
      }
    )
  }
}
