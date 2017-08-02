package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import org.joda.time.DateTime;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import main.java.videoassessment.form.GroupForm;

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

  private List<String> members = new ArrayList();

  public Group(long id, String owner, String name, List<String> members) {
    this.id = id;
    this.owner = owner;
    this.name = name;
    this.members = new ArrayList<>(members);
    this.createdOn = DateTime.now();
  }

  public Group(long id, String owner, GroupForm groupForm) {
    this.id = id;
    this.owner = owner;
    this.createdOn = DateTime.now();

    updateWithForm(groupForm);
  }

  public void updateWithForm(GroupForm groupForm) {
    this.name = groupForm.getName();
    Set<String> members = new HashSet<>();
    for (String member : groupForm.getMembers()) {
      members.add(member.toLowerCase());
    }
    this.members = new ArrayList<>(members);
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

  public List<String> getMembers() {
    return members;
  }

  public DateTime getCreatedOn() {
    return createdOn;
  }

  private Group() {}
}
