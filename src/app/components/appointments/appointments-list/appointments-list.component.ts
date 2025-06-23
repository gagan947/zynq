import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonService } from '../../../services/common.service';
import { AuthService } from '../../../services/auth.service';
import { LoaderService } from '../../../services/loader.service';

@Component({
  selector: 'app-appointments-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './appointments-list.component.html',
  styleUrl: './appointments-list.component.css'
})
export class AppointmentsListComponent {
  constructor(private srevice: CommonService, public auth: AuthService, private router: Router, private route: ActivatedRoute, private loader: LoaderService) {
  }
  
  ngOnInit(): void {
    
  }
}
