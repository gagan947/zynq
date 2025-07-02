import { Component } from '@angular/core';
import { CommonService } from '../../../services/common.service';
import { SocketService } from '../../../services/socket.service';
import { ZegoService } from '../../../services/zego.service';

@Component({
  selector: 'app-solo-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './solo-dashboard.component.html',
  styleUrl: './solo-dashboard.component.css'
})
export class SoloDashboardComponent {

  constructor(private socketService: SocketService, private service: CommonService, private zegoService: ZegoService) {
    this.socketService.userConnected();
  }

  ngOnInit() {
    this.service.post('doctor/isDocterOfflineOrOnline', { isOnline: 1 }).subscribe()
    const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const appID = 1602450801;
    const callerUserID = data.id.replace(/-/g, '');
    const callerUserName = 'user_' + callerUserID;
    const serverSecret = '838170b757bc7b5c7b753a8758a8ae9c';
    this.zegoService.initializeZego(appID, serverSecret, callerUserID, callerUserName);
  }
}
