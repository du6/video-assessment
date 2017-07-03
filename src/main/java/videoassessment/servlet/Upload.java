package main.java.videoassessment.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.appengine.api.blobstore.BlobKey;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;

import main.java.videoassessment.domain.Video;
import main.java.videoassessment.spi.ApiUtils;
import main.java.videoassessment.spi.VideoAssessmentApi;

public class Upload extends HttpServlet {
  private static final Logger LOG = Logger.getLogger(VideoAssessmentApi.class.getName());
  private BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();

  @Override
  public void doPost(HttpServletRequest req, HttpServletResponse res)
      throws ServletException, IOException {

    Map<String, List<BlobKey>> blobs = blobstoreService.getUploads(req);
    List<BlobKey> blobKeys = blobs.get("file");

    if (blobKeys == null || blobKeys.isEmpty()) {
      res.sendError(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
    } else {
      LOG.warning("key: " + blobKeys.get(0).getKeyString() + " email: " + req.getParameter("email") + " title: " + req.getParameter("title"));
      Video video = new Video(
          blobKeys.get(0).getKeyString(),
          req.getParameter("email"),
          req.getParameter("title"));
      ApiUtils.createEntity(video, Video.class);
      res.setStatus(HttpServletResponse.SC_ACCEPTED);
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("success", "yes");
      PrintWriter writer = res.getWriter();
      writer.write(blobKeys.get(0).getKeyString());
      writer.close();
    }
  }
}
