import {
  Input,
  Output,
  Component, 
  EventEmitter, 
  ViewContainerRef
} from '@angular/core';

import { Video } from '../common/video';
import { GapiService } from '../services/gapi.service';

@Component({
  selector: 'video-assessment-video-detail',
  templateUrl: 'video-detail.component.html',
  styleUrls: ['video-detail.component.scss'],
})
export class VideoDetailComponent {
  @Input() video: Video;
  @Output() videoDeleted: EventEmitter<Video> = new EventEmitter<Video>();

  constructor(private gapi_: GapiService){}

  deleteVideo(event: any) {
    event.stopPropagation();
    this.gapi_.deleteVideoByKey(this.video.id)
        .then(() => {
          this.videoDeleted.emit(this.video);
        });
  }
}