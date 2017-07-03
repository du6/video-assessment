package main.java.videoassessment.form;

import java.util.ArrayList;
import java.util.List;

/**
 * Bulk responses from client.
 */
public class BulkResponseForm {
  private String videoId;
  private long templateId;
  private List<Float> scores = new ArrayList<>();
  private List<String> comments = new ArrayList<>();

  public String getVideoId() {
    return videoId;
  }

  public long getTemplateId() {
    return templateId;
  }

  public List<Float> getScores() {
    return scores;
  }

  public List<String> getComments() {
    return comments;
  }
}
