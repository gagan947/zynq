import { Component } from '@angular/core';
import { SocketService } from '../../../services/socket.service';
import { CommonService } from '../../../services/common.service';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZegoService } from '../../../services/zego.service';

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
