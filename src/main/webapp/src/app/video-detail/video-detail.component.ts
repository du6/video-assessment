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

  constructor(){}
}