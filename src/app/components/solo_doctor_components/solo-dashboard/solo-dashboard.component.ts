import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';

@Component({
  selector: 'app-solo-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './solo-dashboard.component.html',
  styleUrl: './solo-dashboard.component.css'
})
export class SoloDashboardComponent {

  constructor(private socketService: SocketService) {
    this.socketService.userConnected();
  }
}
