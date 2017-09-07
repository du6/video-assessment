package main.java.videoassessment.domain;

import com.googlecode.objectify.annotation.Cache;
import com.googlecode.objectify.annotation.Entity;
import com.googlecode.objectify.annotation.Id;
import com.googlecode.objectify.annotation.Index;

import java.util.ArrayList;
import java.util.List;

/**
 * The survey template entity entity
 */
@Entity
@Cache
public class Template extends VideoAssessmentEntity {
  @Id
  private long id;

  @Index
  private String name;

  private List<String> questions = new ArrayList();

  public Template(long id, String name, List<String> questions) {
    this.id = id;
    this.name = name;

    this.questions = new ArrayList<>(questions);
  }

  public long getId() {
    return id;
  }

  public String getName() {
    return name;
  }

  public List<String> getQuestions() {
    return questions;
  }

  private Template() {}
}
