package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;

/**
 * The group entity.
 */
@Entity
@Cache
public class Group extends VideoAssessmentEntity {
  @Id
  private Long id;

  @Index
  private String owner;

  @Index
  private String name;

  @Index
  private DateTime createdOn;

  public Group(long id, String owner, String name) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.createdOn = DateTime.now();
  }

  public long getId() {
    return id;
  }

  public String getOwner() {
    return owner;
  }

  public String getName() {
    return name;
  }

  public DateTime getCreatedOn() {
    return createdOn;
  }

  private Group() {}
}
