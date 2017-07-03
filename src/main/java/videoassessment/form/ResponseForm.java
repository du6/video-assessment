package main.java.videoassessment.form;

/**
 * Client side Response.
 */
public class ResponseForm {
  private String videoId;
  private long templateId;
  private int questionId;
  private float score;
  private String comment;

  public String getVideoId() {
    return videoId;
  }

  public long getTemplateId() {
    return templateId;
  }

  public int getQuestionId() {
    return questionId;
  }

  public float getScore() {
    return score;
  }

  public String getComment() {
    return comment;
  }
}
