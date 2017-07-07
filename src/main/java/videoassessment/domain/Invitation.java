package main.java.videoassessment.domain;

import com.google.api.server.spi.config.AnnotationBoolean;
import com.google.api.server.spi.config.ApiResourceProperty;
import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

/**
 * The supporter invitation entity
 */
@Entity
@Cache
public class Invitation extends VideoAssessmentEntity {
  public enum Status {
    INVITED,
    ACCEPTED,
    DECLINED,
    REVOKED
  }

  @Id
  private Long id;

  @Index
  private String videoId;

  @Index
  private String supporter;

  @Index
  private Status status;

  public Invitation(long id, String videoId, String supporter) {
    this.id = id;
    this.videoId = videoId;
    this.supporter = supporter;
    this.status = Status.INVITED;
  }

  public Long getId() {
    return id;
  }

  public String getVideoId() {
    return videoId;
  }

  public String getSupporter() {
    return supporter;
  }

  public Status getStatus() {
    return status;
  }

  private Invitation() {};
}
