package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;

import main.java.videoassessment.form.VideoForm;

@Entity
@Cache
public class Video extends VideoAssessmentEntity {
  @Id
  private String id;

  @Index
  private String createdBy;

  @Index
  private DateTime uploadedOn;

  @Index
  private boolean isDeleted = false;

  @Index
  private Long topicId;

  private String title;

  public Video(String id, String createdBy, String title) {
    this.id = id;
    this.createdBy = createdBy;
    this.title = title;
    this.uploadedOn = DateTime.now();
  }

  public Video(String createdBy, VideoForm videoForm) {
    this.createdBy = createdBy;
    this.uploadedOn = DateTime.now();
    updateWithVideoForm(videoForm);
  }

  public void updateWithVideoForm(VideoForm videoForm) {
    this.id = videoForm.getBlobKey();
    this.title = videoForm.getTitle();
  }

  public void delete() {
    this.isDeleted = true;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public String getId() {
    return id;
  }

  public String getUploadedOn() {
    return uploadedOn.toString(ISODateTimeFormat.dateTime());
  }

  public String getTitle() {
    return title;
  }

  private Video() {}

  public boolean isDeleted() {
    return isDeleted;
  }
}
