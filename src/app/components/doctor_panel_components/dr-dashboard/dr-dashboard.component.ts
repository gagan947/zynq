import { Component, computed } from '@angular/core';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-dr-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dr-dashboard.component.html',
  styleUrl: './dr-dashboard.component.css'
})
export class DrDashboardComponent {

  constructor(private socketService: SocketService) {
    this.socketService.userConnected();
  }
}
