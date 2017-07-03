import { Injectable } from '@angular/core';
import { Response } from '@angular/http';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { CookieService } from 'angular2-cookie/core';

@Injectable()
export class UploadService {
  progressObservable: Observable<number>;
  private progress: number = 0;
  private progressObserver: any;
  
  constructor(private _cookie: CookieService) {
    this.progressObservable = new Observable<number>(observer => {
        this.progressObserver = observer
    });
  }

  uploadVideo(uploadUrl: string, uploadForm: FormData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let xhr: XMLHttpRequest = new XMLHttpRequest();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          this.progressObserver.complete();
          if (xhr.status === 202) {
            resolve(xhr.response);
          } else {
            reject(this.handleError(xhr.response));
          }
        }
      };

      UploadService.setUploadUpdateInterval(500);

      xhr.upload.onprogress = (event) => {
        this.progress = Math.round(event.loaded / event.total * 100);
        this.progressObserver.next(this.progress);
      };

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.setRequestHeader('X-XSRF-TOKEN', this._cookie.get('XSRF-TOKEN'));
      xhr.send(uploadForm);
    });
  }

  private handleError (error: Response | any) {
	  console.error(error.message || error);
  }

  private static setUploadUpdateInterval (interval: number): void {
    setInterval(() => {}, interval);
  }
}
