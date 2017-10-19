import { VideoDetailComponent } from '../video-detail/video-detail.component';
import { Component, ChangeDetectorRef } from '@angular/core';
import { List } from 'immutable';

import { GapiService } from '../services/gapi.service';
import { Assessment } from '../common/assessment';
import { Template } from '../common/template';
import { Video } from '../common/video';

@Component({
  selector: 'video-assessment-performance',
  templateUrl: 'performance.component.html',
  styleUrls: ['performance.component.scss'],
})
export class PerformanceComponent {
  loadingPerformance: boolean = true;
  templateTitles: Map<number, string> = new Map([[1000, 'Presentation'], [1001, 'Job Interview']]);
  templateQuestions: Map<number, List<String>> = new Map();
  assessments: List<Assessment> = List<Assessment>();
  videos: List<Video> = List<Video>();
  scores: Map<number, Map<number, Object[]>> = new Map();
  templateIds: Set<number> = new Set();

  constructor(private gapi_: GapiService, 
    private changeDetectorRef_: ChangeDetectorRef) {
  }

  ngOnInit() {
    const presentationPromise = this.loadTemplate(1000);
    const jobInterviewPromise = this.loadTemplate(1001);
    const assessmentPromise = this.gapi_.loadMyAssessments().then(assessments => {
      this.assessments = List(assessments);
    });
    const videoPromise = this.gapi_.loadMyVideos().then(videos => {
      this.videos = List(videos);
    });
    Promise.all([presentationPromise, jobInterviewPromise, assessmentPromise, videoPromise])
        .then(() => {
          this.loadingPerformance = false; 
          this.videos.forEach(video => {
            const templateId = Number.parseInt(video.templateId.toString());
            this.templateIds.add(templateId);            
            const videoId = video.id;
            for (let questionId = 0; questionId < this.templateQuestions.get(templateId).size; ++questionId) {
              const score = this.getScore(videoId, questionId);
              if (score <= 0) {
                continue;
              }
              const date = video.uploadedOn;
              this.scores.get(templateId).get(questionId).push({x: date, y: score});
            }
          });
        })
        .then(() => this.changeDetectorRef_.detectChanges())
        .then(() => this.drawAssessments());
  }

  private drawAssessments() {
    this.scores.forEach((questionScores, templateId) => {
      if (!this.templateIds.has(templateId)) {
        return;
      }
      questionScores.forEach((scores, questionId) => {
        const container = document.getElementById('assessments-drawer-' + templateId + '-' + questionId);
        const dataset = new vis.DataSet(scores);
        const options = {
          width:  '100%',
          height: '200px',
          zoomable: false,
        };
        const graph2d = new vis.Graph2d(container, dataset, options);
      })
    });
  }

  private loadTemplate(templateId: number) {
    this.gapi_.loadTemplate(templateId).then(
      (template: Template) => {
        this.templateQuestions.set(templateId, List(template.questions));
        let questionMap = new Map();
        for (let questionId = 0; questionId < this.templateQuestions.get(templateId).size; ++questionId) {
          questionMap.set(questionId, []);
        }
        this.scores.set(templateId, questionMap);
      }
    );
  }

  private getScore(videoId: string, questionId: number) {
    const assessments = this.assessments
        .filter(assessment => assessment.videoId == videoId && 
            Number.parseInt(assessment.questionId.toString()) == questionId);
    if (assessments.size == 0) {
      return -1;
    }
    let total = assessments.reduce((sum, assessment) => sum + assessment.score, 0);
    return total / assessments.size;
  }
}
