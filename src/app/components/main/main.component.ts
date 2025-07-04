import { Component } from '@angular/core';
import { HeaderComponent } from "../shared/header/header.component";
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { CommonService } from '../../services/common.service';
import { ZegoService } from '../../services/zego.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, SidebarComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(private service: CommonService, private zegoService: ZegoService) { }
  ngOnInit() {
    // this.service.post('doctor/isDocterOfflineOrOnline', { isOnline: 1 }).subscribe()
    const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const appID = 1602450801;
    const callerUserID = data.id.replace(/-/g, '');
    const callerUserName = 'user_' + callerUserID;
    const serverSecret = '838170b757bc7b5c7b753a8758a8ae9c';
    this.zegoService.initializeZego(appID, serverSecret, callerUserID, callerUserName);
  }
}
