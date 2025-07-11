import { Injectable } from '@angular/core';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';
import { ZIM } from 'zego-zim-web';
import { CommonService } from './common.service';


@Injectable({
      providedIn: 'root'
})
export class ZegoService {
      private zegoInstance: any;
      private appointment_id: string | null = null;
      constructor(private service: CommonService) { }

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

      async sendCall(targetUser: any, appointment_id: any) {
            this.appointment_id = appointment_id;
            if (!this.zegoInstance) {
                  const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
                  const appID = 1602450801;
                  const callerUserID = data.id.replace(/-/g, '');
                  const callerUserName = 'user_' + callerUserID;
                  const serverSecret = '838170b757bc7b5c7b753a8758a8ae9c';
                  this.initializeZego(appID, serverSecret, callerUserID, callerUserName);
            }

            setTimeout(() => {
                  try {
                        const res = this.zegoInstance.sendCallInvitation({
                              callees: [targetUser],
                              callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
                              timeout: 45,
                        });
                        this.changeStatus({ callStatus: "Ongoing" });
                        console.log('Call result:', res);
                  } catch (err) {
                        console.error('Error sending call:', err);
                  }
            }, 1500);

            this.zegoInstance.setCallInvitationConfig({
                  onOutgoingCallAccepted: async (callID: string, callee: any) => {
                        await this.changeStatus({ callStatus: "Completed", callID, receiverId: callee.id });
                  },

                  onOutgoingCallDeclined: async (callID: string, callee: any) => {
                        // await this.changeStatus({ callStatus: "rejected", callID, receiverId: callee.id });
                  },

                  onOutgoingCallTimeout: async (callID: string, callee: any) => {
                        // await this.changeStatus({ callStatus: "missed", callID, receiverId: callee.id });
                  },

                  onOutgoingCallSent: async (callID: string, callee: any[]) => {
                        const receiverId = callee[0]?.id;
                        // await this.changeStatus({ callStatus: "Ongoing", callID, receiverId: receiverId });
                  }
            });
      }

      async changeStatus(data: any) {
            let formData = {
                  appointment_id: this.appointment_id,
                  status: data.callStatus,
            }
            this.service.update('api/update-appointment-status', formData).subscribe();
      }
}
