import { VideoDetailComponent } from '../video-detail/video-detail.component';
import { Component, ChangeDetectorRef } from '@angular/core';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Profile } from '../common/profile';
import { Template } from '../common/template';

@Component({
  selector: 'video-assessment-performance',
  templateUrl: 'performance.component.html',
  styleUrls: ['performance.component.scss'],
})
export class PerformanceComponent {
  loadingPerformance: boolean = true;
  profiles: List<Profile> = List<Profile>();
  questions: List<string> = List<string>();
  topics = ['Job Interview', 'Training Presentation', 'Recruiting Talk', 'Inspirational Talk', 'Strategy Case'];

  constructor(private gapi_: GapiService, 
    private changeDetectorRef_: ChangeDetectorRef) {
  }

  ngOnInit() {
    const presentationPromise = this.loadTemplate(1000);
    const profilePromise = this.loadProfiles();
  
    Promise.all([presentationPromise, profilePromise])
        .then(() => {
          this.loadingPerformance = false; 
        })
        .then(() => this.changeDetectorRef_.detectChanges())
        .then(() => this.drawAssessments());
  }

  private drawAssessments() {
    const scores = [
      [6.2, 5.3, 6.6, 8.1, 8.5, 9.1], [7.3, 5.1, 5.6, 7.3, 8.4, 8.1], [6.2, 4.3, 5.5, 7.7, 6.2, 8.2], 
      [6.4, 5.4, 6.5, 7.1, 5.8, 7.9], [5.6, 4.5, 6.6, 8.1, 6.8, 6.9], [5.6, 5.5, 6.6, 7.8, 8.2, 8.9], 
      [7.6, 5.5, 5.6, 6.8, 7.8, 7.9], [6.6, 5.5, 6.3, 8.1, 6.8, 8.9], [6.1, 5.5, 5.6, 7.8, 7.8, 6.9], 
      [8.6, 6.5, 5.6, 7.8, 8.8, 9.3], [6.5, 5.6, 6.5, 7.8, 6.8, 7.9], [7.6, 4.5, 6.6, 8.1, 8.2, 8.8], 
      [7.7, 7.5, 7.6, 8.8, 6.8, 7.9], [8.1, 5.2, 6.0, 8.1, 8.3, 7.9], [6.0, 5.2, 6.5, 8.4, 8.5, 9.1], 
      [7.4, 5.4, 6.4, 6.8, 7.8, 8.9], [6.1, 5.6, 6.6, 8.4, 6.8, 7.9], [8.6, 6.5, 6.6, 8.9, 7.8, 8.5], 
      [6.7, 7.5, 5.6, 5.8, 7.8, 7.9], [6.3, 5.4, 6.6, 8.0, 8.3, 8.9],
    ];
    const dates = ['2017-9-7', '2017-9-14', '2017-9-21', '2017-9-28', '2017-10-3', '2017-10-10'];

    for (let questionId = 0; questionId < 20; ++questionId) {
      const scoresByDates = scores[questionId];
      const container = document.getElementById('assessments-drawer-' + questionId);
      const options = {
        width:  '100%',
        height: '200px',
        zoomable: false,
      };
      let data = [];
      for (let i = 0; i < 6; ++i) {
        data.push({x: dates[i], y: scoresByDates[i]});
      }
      const dataset = new vis.DataSet(data);      
      const graph2d = new vis.Graph2d(container, dataset, options);
    };
  }

  private loadTemplate(templateId: number) {
    return this.gapi_.loadTemplate(templateId).then(
      (template: Template) => {
        this.questions = List(template.questions);
      }
    );
  }

  private loadProfiles() {
    return this.gapi_.getAllProfiles().then(profiles => {
      profiles = profiles.filter(profile => profile.name && profile.name.length > 0);
      this.profiles = List(profiles);
    })
  }
}
