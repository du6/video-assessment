import { Component } from '@angular/core';

import * as FileSaver from 'file-saver';

import { GapiService } from '../services/gapi.service';

@Component({
  selector: 'video-assessment-demo',
  templateUrl: 'demo.component.html',
  styleUrls: ['demo.component.scss'],
})
export class DemoComponent {
  public score: number = 0;
  public scoreLoading: number = 0;
  public totalCount = 10;
  public count = 0;
  public isRecording = false;
  public webcam;
  public options = {
    audio: true,
    video: true,
    width: 640,
    height: 480,
    fallbackSrc: 'jscam_canvas_only.swf',
  };
  private chunks: any = [];
  private mediaRecorder: any;

  constructor(private gapi_: GapiService,) {
  }
  
  onCamError(err){}
  
  onCamSuccess(stream: any){    
    this.mediaRecorder = new MediaRecorder(stream);
    this.mediaRecorder.onstop = e => {
      const blob = new Blob(this.chunks, { 'type': 'audio/ogg; codecs=opus' });
      const filename = "audio.ogg";
      var file = new File([blob], filename);
      FileSaver.saveAs(file, filename)
      this.chunks.length = 0;
    };

    this.mediaRecorder.ondataavailable = e => this.chunks.push(e.data);
  }

  startRecord() {
    this.isRecording = true;
    this.delayCaptureImage();
    this.mediaRecorder.start();
  }

  private delayCaptureImage() {
    this.scoreLoading = 0;
    if (this.count == this.totalCount) {
      this.mediaRecorder.stop();
      setTimeout(() => {
        this.count = 0;
        this.isRecording = false;
        this.scoreLoading = 1;
      }, 100);
      setTimeout(() => {
        this.gapi_.getScore().then(score => {
          this.score = score;
          this.scoreLoading = 2;
        });
      }, 5000);
    } else {
      setTimeout(() => {
        ++this.count;
        this.captureImage();
        this.delayCaptureImage();
      }, 1000);
    }
  }

  captureImage() {
    this.webcam.getBase64()
    .then( base => {
      var byteString = atob(base.split(',')[1]);
      // write the bytes of the string to an ArrayBuffer
      var ab = new ArrayBuffer(byteString.length);
      var ia = new Uint8Array(ab);
      for (var i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      var blob = new Blob([ab]);
      const filename = 'capture_' + this.count + '.png';
      var file = new File([blob], filename);
      FileSaver.saveAs(file, filename)
    })
    .catch( e => console.error(e) );
  }
}
