import { UserHelper } from './../Utilities/user-helper';
import { User } from './../Model/User';
import { Camera } from '@ionic-native/camera';
import { PhotoHelper } from './../Utilities/photo-helper';
import { Message } from './../Model/Message';
import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, AlertController, ToastController } from 'ionic-angular';
import { AngularFire } from 'angularfire2'
import firebase from 'firebase'
import { Content } from 'ionic-angular';
@Component({
  templateUrl: 'message-board-page.html',
})
export class MessageBoardPage {
  cUser: User;
  ref: any;
  currentMessage: string = ""
  photoHelper: PhotoHelper
  messages: Message[] = []
  jobKey: string
  @ViewChild('content') content: Content;
  constructor(public af: AngularFire, public alertCtrl: AlertController, public navCtrl: NavController,
    public navParams: NavParams, public toastCtrl: ToastController, public camera: Camera) {
    this.cUser = UserHelper.getCurrentUser()
    this.jobKey = navParams.data.key;
    this.photoHelper = new PhotoHelper(this.cUser.name, this.camera);
  }

  ngAfterViewInit() {
    let c = this.content
    firebase.database().ref("requests/" + this.jobKey + "/messageBoard/messages/").on('value', snap => {
      if (snap.exists()) {
        this.messages = []
        Object.keys(snap.val()).forEach(key => {
          let m = snap.val()[key]
          let msg = new Message();
          Object.assign(msg, m)
          this.messages.push(msg)
        })
        setTimeout(function () {
          try {
            c.scrollToBottom(1000)
          } catch (e) {
          }
        }, 300);
      }
    })
  }
  ngOnInit() {
    // this returns undefined
  }

  isMobile() {
    if (navigator.userAgent.match(/Android/i)
      || navigator.userAgent.match(/webOS/i)
      || navigator.userAgent.match(/iPhone/i)
      || navigator.userAgent.match(/iPad/i)
      || navigator.userAgent.match(/iPod/i)
      || navigator.userAgent.match(/BlackBerry/i)
      || navigator.userAgent.match(/Windows Phone/i)
    ) {
      return true
    }
    else {
      return false
    }
  }
  postMessage() {
    var m = new Message();
    m.sender = this.cUser.name;
    m.text = this.currentMessage
    this.currentMessage = ''
    m.setTime(new Date())
    if (this.photoHelper.photos.length > 0) {
      this.photoHelper.uplaod().then(() => {
        m.imageUrl = this.photoHelper.photos[0].URL;
        firebase.database().ref('requests/' + this.jobKey + '/messageBoard/messages/').push(m).then(() => {
          this.photoHelper.photos.pop();
        })
      })
    } else if (m.text.length > 0) {
      firebase.database().ref('requests/' + this.jobKey + '/messageBoard/messages/').push(m).then(() => {
      })
    }

  }
  takePicture() {
    this.photoHelper.photos = []
    this.photoHelper.snap();
    let toast = this.toastCtrl.create({
      message: 'If you like to upload pic, click send',
      duration: 1200
    });
    toast.present();
  }
}
