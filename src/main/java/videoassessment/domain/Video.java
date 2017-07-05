package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;
import org.joda.time.format.ISODateTimeFormat;

import java.util.ArrayList;
import java.util.List;

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

  private String title;

  private List<String> supporters = new ArrayList();;

  public Video(String id, String createdBy, String title) {
    this.id = id;
    this.createdBy = createdBy;
    this.title = title;
    this.uploadedOn = DateTime.now();
    this.supporters = new ArrayList<>();
  }

  public Video(String createdBy, VideoForm videoForm) {
    this.createdBy = createdBy;
    this.uploadedOn = DateTime.now();
    updateWithVideoForm(videoForm);
  }

  public void updateWithVideoForm(VideoForm videoForm) {
    this.id = videoForm.getBlobKey();
    this.title = videoForm.getTitle();
    this.supporters = videoForm.getSupporters();
  }

  public void delete() {
    this.isDeleted = true;
  }

  public String getCreatedBy() {
    return createdBy;
  }

  public List<String> getSupporters() {
    return supporters;
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
}
