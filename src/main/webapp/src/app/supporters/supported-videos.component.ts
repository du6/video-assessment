import { Component } from '@angular/core';
import { GapiService } from '../services/gapi.service';

@Component({
  selector: 'video-assessment-supported-videos',
  templateUrl: 'supported-videos.component.html',
  styleUrls: ['supported-videos.component.scss'],
})
export class SupportedVideosComponent {
  constructor(private gapi_: GapiService) {
  }
}