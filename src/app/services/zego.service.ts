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
      }

      async sendCall(targetUser: any, appointment_id: any) {
            this.appointment_id = appointment_id;
            if (!this.zegoInstance) {
                  const data = JSON.parse(localStorage.getItem('userInfo') || '{}');
                  const appID = 1107673050;
                  const callerUserID = data.id.replace(/-/g, '');
                  const callerUserName = 'user_' + callerUserID;
                  const serverSecret = 'ee4c4f96155128036920c19b9e997b3d';
                  this.initializeZego(appID, serverSecret, callerUserID, callerUserName);
            }

            setTimeout(() => {
                  try {
                        const res = this.zegoInstance.sendCallInvitation({
                              callees: [targetUser],
                              callType: ZegoUIKitPrebuilt.InvitationTypeVideoCall,
                              timeout: 45,
                              data: JSON.stringify({
                                    appointmentId: this.appointment_id,
                                    type: 'appointment',
                              })
                        });
                        this.changeStatus({ callStatus: "Ongoing" });
                  } catch (err) {
                        console.error('Error sending call:', err);
                  }
            }, 1500);

            this.zegoInstance.setCallInvitationConfig({
                  onOutgoingCallAccepted: async (callID: string, callee: any) => {
                        document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.add('show');
                        await this.changeStatus({ callStatus: "Completed", callID, receiverId: callee.id });
                  },

                  onOutgoingCallDeclined: async (callID: string, callee: any) => {
                        document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.remove('show');
                        const element = document.getElementsByClassName('H6djxujDyBWSH05jmS1c')[0] as HTMLElement;
                        const element2 = document.getElementsByClassName('BYpXSnOHfrC2td4QRijO')[0] as HTMLElement;
                        if (element) {
                              element.style.setProperty('width', '100vw', 'important');
                        }
                        if (element2) {
                              element2.style.setProperty('width', '100vw', 'important');
                        }
                  },

                  onOutgoingCallTimeout: async (callID: string, callee: any) => {
                        document.getElementsByClassName('ct_video_call_right_sie_bar')[0].classList.remove('show');
                        const element = document.getElementsByClassName('H6djxujDyBWSH05jmS1c')[0] as HTMLElement;
                        const element2 = document.getElementsByClassName('BYpXSnOHfrC2td4QRijO')[0] as HTMLElement;
                        if (element) {
                              element.style.setProperty('width', '100vw', 'important');
                        }
                        if (element2) {
                              element2.style.setProperty('width', '100vw', 'important');
                        }
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
