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
import com.google.appengine.api.datastore.Query;
import com.google.common.base.Strings;

import main.java.videoassessment.domain.Response;
import main.java.videoassessment.domain.Video;
import main.java.videoassessment.spi.ApiUtils;
import main.java.videoassessment.spi.VideoAssessmentApi;

import static main.java.videoassessment.service.OfyService.ofy;

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
      LOG.warning("key: " + blobKeys.get(0).getKeyString() + " email: "
          + req.getParameter("email") + " title: " + req.getParameter("title"));
      String groupIdStr = req.getParameter("groupId");
      String topicIdStr = req.getParameter("topicId");
      long groupId = Strings.isNullOrEmpty(groupIdStr) ? -1 : Long.parseLong(groupIdStr);
      long topicId = Strings.isNullOrEmpty(topicIdStr) ? -1 : Long.parseLong(topicIdStr);
      String email = req.getParameter("email").toLowerCase();
      if (topicId > 0) {
        final Query.Filter topicIdFilter =
            new Query.FilterPredicate("topicId", Query.FilterOperator.EQUAL, topicId);
        final Query.Filter ownerFilter =
            new Query.FilterPredicate("createdBy", Query.FilterOperator.EQUAL, email);
        List<Video> existingVideos = ofy().load().type(Video.class)
            .filter(ownerFilter)
            .filter(topicIdFilter)
            .list();
        if (!existingVideos.isEmpty()) {
          throw new RuntimeException("Can only upload one video per user per topic!");
        }
      }
      Video video = new Video(
          blobKeys.get(0).getKeyString(),
          email,
          req.getParameter("title"),
          groupId,
          topicId);
      ApiUtils.createEntity(video, Video.class);
      updateResponses(groupId, topicId, video.getId(), req.getParameter("email").toLowerCase());
      res.setStatus(HttpServletResponse.SC_ACCEPTED);
      res.setHeader("Content-Type", "text/plain");
      res.setHeader("success", "yes");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
      PrintWriter writer = res.getWriter();
      writer.write(blobKeys.get(0).getKeyString());
      writer.close();
    }
  }

  private void updateResponses(long groupId, long topicId, String videoId, String user) {
    final Query.Filter groupFilter =
        new Query.FilterPredicate("groupId", Query.FilterOperator.EQUAL, groupId);
    final Query.Filter topicFilter =
        new Query.FilterPredicate("topicId", Query.FilterOperator.EQUAL, topicId);
    final Query.Filter userFilter =
        new Query.FilterPredicate("forUser", Query.FilterOperator.EQUAL, user);
    List<Response> responseList = ofy().load().type(Response.class)
        .filter(userFilter)
        .filter(groupFilter)
        .filter(topicFilter)
        .list();
    for (Response response : responseList) {
      response.updateVideoId(videoId);
    }
    ofy().save().entities(responseList);
  }
}
