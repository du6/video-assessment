package main.java.videoassessment.spi;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.DefaultValue;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.users.User;
import com.googlecode.objectify.Key;
import com.googlecode.objectify.cmd.Query;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.logging.Logger;

import javax.inject.Named;

import main.java.videoassessment.Constants;
import main.java.videoassessment.domain.Invitation;
import main.java.videoassessment.domain.Response;
import main.java.videoassessment.domain.Template;
import main.java.videoassessment.domain.UploadUrl;
import main.java.videoassessment.domain.Video;
import main.java.videoassessment.form.BulkResponseForm;
import main.java.videoassessment.form.ResponseForm;
import main.java.videoassessment.form.VideoForm;

import static main.java.videoassessment.service.OfyService.factory;
import static main.java.videoassessment.service.OfyService.ofy;
import static main.java.videoassessment.spi.ApiUtils.TEMPLATE_ID;

/**
 * Defines mind tree APIs.
 */
@Api(name = "videoAssessmentApi", version = "v1",
    scopes = { Constants.EMAIL_SCOPE }, clientIds = {
    Constants.WEB_CLIENT_ID,
    Constants.API_EXPLORER_CLIENT_ID },
    description = "API for the Video Assessment application.")
public class VideoAssessmentApi {

  private static final String DEFAULT_QUERY_LIMIT = "1000";
  private static final Logger LOG = Logger.getLogger(VideoAssessmentApi.class.getName());

  @ApiMethod(
      name = "createVideo",
      path = "createVideo",
      httpMethod = HttpMethod.POST)
  public Video createVideo(
      final User user,
      final VideoForm form) {
    Video video = new Video(user.getEmail().toLowerCase(), form);
    return (Video) ApiUtils.createEntity(video, Video.class);
  }

  @ApiMethod(
      name = "deleteVideo",
      path = "deleteVideo",
      httpMethod = HttpMethod.POST)
  public Video deleteVideo(
      final User user,
      @Named("video") final String videoId) throws UnauthorizedException {
    Video video = getVideoForOwnerById(videoId, user);
    video.delete();
    ofy().save().entity(video);
    return video;
  }

  @ApiMethod(
      name = "getVideoByKey",
      path = "getVideoByKey",
      httpMethod = HttpMethod.POST)
  public Video getVideoByKey(
      final User user,
      @Named("video") final String videoId) throws UnauthorizedException {
    Video video = getVideoForOwnerById(videoId, user);
    return video;
  }

  private Video getVideoForOwnerById(String videoId, User owner) throws UnauthorizedException {
    Video video = ofy().load().type(Video.class).id(videoId).now();
    if (!video.getCreatedBy().equals(owner.getEmail().toLowerCase())) {
      throw new UnauthorizedException("User is not video owner.");
    }
    return video;
  }

  @ApiMethod(
      name = "getMyVideos",
      path = "getMyVideos",
      httpMethod = HttpMethod.POST)
  public List<Video> getMyVideos(
      final User user,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter deleteFilter = new FilterPredicate("isDeleted", FilterOperator.EQUAL, false);
    final Filter ownerFilter =
        new FilterPredicate("createdBy", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    return ofy().load().type(Video.class).filter(deleteFilter).filter(ownerFilter).limit(limit)
        .list();
  }

  @ApiMethod(
      name = "getMySupportedVideos",
      path = "getMySupportedVideos",
      httpMethod = HttpMethod.POST)
  public List<Video> getMySupportedVideos(
      final User user,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter supporterFilter =
        new FilterPredicate("supporter", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    List<Invitation> invitations =
        ofy().load().type(Invitation.class).filter(supporterFilter).limit(limit).list();
    Set<String> videoIds = new HashSet<>();
    for (Invitation invitation : invitations) {
      videoIds.add(invitation.getVideoId());
    }
    Map<String, Video> supportedVideoMap = ofy().load().type(Video.class).ids(videoIds);
    List<Video> supportedVideos = new ArrayList<>();
    for (String id : supportedVideoMap.keySet()) {
      if (!supportedVideoMap.get(id).isDeleted()) {
        supportedVideos.add(supportedVideoMap.get(id));
      }
    }
    return supportedVideos;
  }

  @ApiMethod(
      name = "createResponse",
      path = "createResponse",
      httpMethod = HttpMethod.POST)
  public Response createResponse(
      final User user,
      final ResponseForm form) {
    Key<Response> key = factory().allocateId(Response.class);
    Response response = new Response(key.getId(), user.getEmail().toLowerCase(), form);
    return (Response) ApiUtils.createEntity(response, Response.class);
  }

  @ApiMethod(
      name = "getInvitationsForVideo",
      path = "getInvitationsForVideo",
      httpMethod = HttpMethod.POST)
  public List<Invitation> getInvitationsForVideo(
      final User user,
      @Named("video") final String videoId,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit)
      throws UnauthorizedException {
    getVideoForOwnerById(videoId, user);
    final Filter videoFilter = new FilterPredicate("videoId", FilterOperator.EQUAL, videoId);
    return ofy().load().type(Invitation.class).filter(videoFilter).limit(limit).list();
  }

  @ApiMethod(
      name = "inviteSupporter",
      path = "inviteSupporter",
      httpMethod = HttpMethod.POST)
  public Invitation inviteSupporter(
      final User user,
      @Named("video") final String videoId,
      @Named("supporter") final String supporterEmail) throws UnauthorizedException {
    getVideoForOwnerById(videoId, user);
    Key<Invitation> key = factory().allocateId(Invitation.class);
    Invitation invitation = new Invitation(key.getId(), videoId, supporterEmail);
    return (Invitation) ApiUtils.createEntity(invitation, Invitation.class);
  }

  @ApiMethod(
      name = "deleteSupporter",
      path = "deleteSupporter",
      httpMethod = HttpMethod.DELETE)
  public void deleteSupporter(
      final User user,
      @Named("id") final Long id) throws UnauthorizedException {
    Invitation invitation = ofy().load().type(Invitation.class).id(id).now();
    String videoId = invitation.getVideoId();
    getVideoForOwnerById(videoId, user);
    ofy().delete().entity(invitation);
  }

  @ApiMethod(
      name = "createBulkResponse",
      path = "createBulkResponse",
      httpMethod = HttpMethod.POST)
  public void createBulkResponse(
      final User user,
      final BulkResponseForm form) {
    assert form.getComments().size() == form.getScores().size();
    for (int i = 0; i < form.getScores().size(); ++i) {
      if (form.getScores().get(i) == 0 && form.getComments().get(i).isEmpty()) {
        continue;
      }
      Key<Response> key = factory().allocateId(Response.class);
      Response response = new Response(key.getId(),
          user.getEmail().toLowerCase(),
          form.getVideoId(),
          form.getTemplateId(),
          i,
          form.getScores().get(i),
          form.getComments().get(i));
      ApiUtils.createEntity(response, Response.class);
    }
  }

  @ApiMethod(
      name = "getResponses",
      path = "getResponses",
      httpMethod = HttpMethod.POST
  )
  public List<Response> getResponses(
      final User user,
      @Named("video") final String videoId,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter templateFilter =
        new FilterPredicate("templateId", FilterOperator.EQUAL, TEMPLATE_ID);
    final Filter videoFilter =
        new FilterPredicate("videoId", FilterOperator.EQUAL, videoId);

    Query<Response> query = ofy().load().type(Response.class)
        .limit(limit)
        .filter(templateFilter)
        .filter(videoFilter);

    Video video = ofy().load().type(Video.class).id(videoId).now();
    if (video == null) {
      LOG.warning("Video " + videoId + " does not exist!");
      return new ArrayList<>();
    }

    String videoOwner = video.getCreatedBy();
    if (videoOwner.equals(user.getEmail().toLowerCase())) {
      return query.list();
    }

    final Filter createrFilter =
        new FilterPredicate("createdBy", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    return query.filter(createrFilter).list();
  }

  @ApiMethod(
      name = "getTemplate",
      path = "getTemplate",
      httpMethod = HttpMethod.POST
  )
  public Template getTemplate() {
    return ofy().load().type(Template.class).id(TEMPLATE_ID).now();
  }

  @ApiMethod(
      name = "getUploadUrl",
      path = "getUploadUrl",
      httpMethod = HttpMethod.POST
  )
  public UploadUrl getUploadUrl() {
    return new UploadUrl(ApiUtils.createVideoUploadUrl("/upload"));
  }
}