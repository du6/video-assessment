import { Component } from '@angular/core';

import * as FileSaver from 'file-saver';

@Component({
  selector: 'video-assessment-demo',
  templateUrl: 'demo.component.html',
  styleUrls: ['demo.component.scss'],
})
export class DemoComponent {
  public totalCount = 10;
  public count = 0;
  public isRecording = false;
  public webcam;
  public options = {
    audio: false,
    video: true,
    width: 640,
    height: 480,
    fallbackSrc: 'jscam_canvas_only.swf',
  };

  constructor() {
  }
  
  onCamError(err){}
  
  onCamSuccess(event: any){
  }

  startRecord() {
    this.isRecording = true;
    this.delayCaptureImage();
  }

  private delayCaptureImage() {
    if (this.count == this.totalCount) {
      setTimeout(() => {
        this.count = 0;
        this.isRecording = false;
      }, 100);
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
      var file = new File([blob, blob], filename);
      FileSaver.saveAs(file, filename)
    })
    .catch( e => console.error(e) );
  }
}
