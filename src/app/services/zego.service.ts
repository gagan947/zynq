import { Injectable } from '@angular/core';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZIM } from 'zego-zim-web';


@Injectable({
      providedIn: 'root'
})
export class ZegoService {
      private zegoInstance: any;

      initializeZego(appID: number, serverSecret: string, userID: string, userName: string) {
            const roomID = 'default_room';

            const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
                  appID,
                  serverSecret,
                  roomID,
                  userID,
                  userName
            );

            this.zegoInstance = ZegoUIKitPrebuilt.create(kitToken);

            this.zegoInstance.addPlugins({ ZIM });

            this.zegoInstance.setLanguage("en-US");

            this.zegoInstance.setCallInvitationConfig({
                  enableNotifyWhenAppRunningInBackgroundOrQuit: true,
            });

            console.log('Zego initialized for user:', userName);
      }

      async sendCall(targetUser: any) {
            if (!this.zegoInstance) {
                  console.warn('Zego is not initialized');
                  return;
            }

            try {
                  const res = await this.zegoInstance.sendCallInvitation({
                        callees: [targetUser],
                        callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
                        timeout: 60,
                  });
                  console.log('Call result:', res);
            } catch (err) {
                  console.error('Error sending call:', err);
            }
      }
}
