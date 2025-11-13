import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { CommonService } from '../../services/common.service';
import { ZegoService } from '../../services/zego.service';
import { SocketService } from '../../services/socket.service';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SidebarComponent, FooterComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(private service: CommonService, private zegoService: ZegoService, private socketService: SocketService) { }
  ngOnInit() {
    // this.service.post('doctor/isDocterOfflineOrOnline', { isOnline: 1 }).subscribe()
    const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const appID = 1107673050;
    const callerUserID = data.id.replace(/-/g, '');
    const doctorName = data.doctor_name;
    const callerUserName = 'user_' + callerUserID;
    const serverSecret = 'ee4c4f96155128036920c19b9e997b3d';
    this.zegoService.initializeZego(appID, serverSecret, callerUserID, doctorName);
    this.socketService.connect(data.id);
  }
}
