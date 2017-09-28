package main.java.videoassessment.servlet;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import main.java.videoassessment.domain.Score;
import main.java.videoassessment.spi.ApiUtils;

/**
 * Create score entity for demo.
 */
public class ScoreUpload extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {
    String scoreStr = req.getParameter("score");
    int score = Integer.parseInt(scoreStr);
    Score scoreEntity = new Score(score);
    ApiUtils.createEntity(scoreEntity, Score.class);
  }
}
