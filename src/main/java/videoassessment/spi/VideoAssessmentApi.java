package main.java.videoassessment.spi;

import com.google.api.server.spi.config.Api;
import com.google.api.server.spi.config.ApiMethod;
import com.google.api.server.spi.config.ApiMethod.HttpMethod;
import com.google.api.server.spi.config.DefaultValue;
import com.google.api.server.spi.config.Nullable;
import com.google.api.server.spi.response.UnauthorizedException;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import com.google.appengine.api.taskqueue.Queue;
import com.google.appengine.api.taskqueue.QueueFactory;
import com.google.appengine.api.taskqueue.TaskOptions;
import com.google.appengine.api.users.User;
import com.google.common.base.Strings;
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
import main.java.videoassessment.domain.AppEngineUser;
import main.java.videoassessment.domain.Group;
import main.java.videoassessment.domain.Invitation;
import main.java.videoassessment.domain.Membership;
import main.java.videoassessment.domain.Response;
import main.java.videoassessment.domain.Score;
import main.java.videoassessment.domain.Template;
import main.java.videoassessment.domain.Topic;
import main.java.videoassessment.domain.UploadUrl;
import main.java.videoassessment.domain.Video;
import main.java.videoassessment.form.BulkResponseForm;
import main.java.videoassessment.form.ResponseForm;

import static main.java.videoassessment.service.OfyService.factory;
import static main.java.videoassessment.service.OfyService.ofy;
import static main.java.videoassessment.spi.ApiUtils.PRESENTATION_TEMPLATE_ID;

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
      name = "createUser",
      path = "createUser",
      httpMethod = HttpMethod.POST)
  public AppEngineUser createUser(
      final User user) {
    AppEngineUser appEngineUser = getUser(user);
    if (appEngineUser != null) {
      return appEngineUser;
    }
    appEngineUser = new AppEngineUser(user);
    return (AppEngineUser) ApiUtils.createEntity(appEngineUser, AppEngineUser.class);
  }

  @ApiMethod(
      name = "getUser",
      path = "getUser",
      httpMethod = HttpMethod.POST)
  public AppEngineUser getUser(
      final User user) {
    return ofy().load().type(AppEngineUser.class).id(user.getEmail().toLowerCase()).now();
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
    return ofy().load().type(Video.class).id(videoId).now();
  }

  private Video getVideoForOwnerById(String videoId, User owner) throws UnauthorizedException {
    Video video = ofy().load().type(Video.class).id(videoId).now();
    if (!video.getCreatedBy().equalsIgnoreCase(owner.getEmail())) {
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
      name = "getVideosByGroupId",
      path = "getVideosByGroupId",
      httpMethod = HttpMethod.POST)
  public List<Video> getVideosByGroupId(
      final User user,
      @Named("groupId") final Long groupId,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter groupIdFilter = new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
    return ofy().load().type(Video.class).filter(groupIdFilter).limit(limit).list();
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
    Invitation invitation = new Invitation(key.getId(), videoId, supporterEmail.toLowerCase());
    final Queue queue = QueueFactory.getDefaultQueue();
    queue.add(ofy().getTransaction(),
        TaskOptions.Builder.withUrl("/tasks/send_email")
            .param("type", "request")
            .param("email", supporterEmail)
            .param("me", user.getEmail())
            .param("videoLink", "http://talkmeup.net/dist/#/video-comment/" + videoId));
    return (Invitation) ApiUtils.createEntity(invitation, Invitation.class);
  }

  @ApiMethod(
      name = "sendFeedback",
      path = "sendFeedback",
      httpMethod = HttpMethod.POST)
  public void sendFeedback(
      final User user,
      @Named("feedback") final String feedback) {
    final Queue queue = QueueFactory.getDefaultQueue();
    queue.add(ofy().getTransaction(),
        TaskOptions.Builder.withUrl("/tasks/send_feedback")
            .param("from", user.getEmail())
            .param("feedback", feedback));
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
    List<Response> responseList = new ArrayList<>(form.getComments().size());
    for (int i = 0; i < form.getScores().size(); ++i) {
      if (form.getScores().get(i) == 0 && form.getComments().get(i).isEmpty()) {
        continue;
      }
      Key<Response> key = factory().allocateId(Response.class);
      Response response;
      if (form.getVideoId() != null) {
        response = new Response(key.getId(),
            user.getEmail().toLowerCase(),
            form.getVideoId(),
            form.getTemplateId(),
            i,
            form.getScores().get(i),
            form.getComments().get(i));
      } else {
        long groupId = form.getGroupId();
        long topicId = form.getTopicId();
        final Filter groupFilter = new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
        final Filter topicFilter = new FilterPredicate("topicId", FilterOperator.EQUAL, topicId);
        final Filter userFilter = new FilterPredicate("createdBy", FilterOperator.EQUAL,
            form.getForUser().toLowerCase());
        List<Video> videoList = ofy().load().type(Video.class)
            .filter(userFilter)
            .filter(groupFilter)
            .filter(topicFilter)
            .list();
        if (!videoList.isEmpty()) {
          response = new Response(key.getId(),
              user.getEmail().toLowerCase(),
              videoList.get(0).getId(),
              form.getTemplateId(),
              i,
              form.getScores().get(i),
              form.getComments().get(i));
        } else {
          response = new Response(key.getId(),
              user.getEmail().toLowerCase(),
              groupId,
              topicId,
              form.getForUser().toLowerCase(),
              form.getTemplateId(),
              i,
              form.getScores().get(i),
              form.getComments().get(i));
        }
      }
      responseList.add(response);
    }
    ofy().save().entities(responseList);
    if (form.getVideoId() != null) {
      String videoId = form.getVideoId();
      Video video = ofy().load().type(Video.class).id(videoId).now();
      String owner = video.getCreatedBy();
      final Queue queue = QueueFactory.getDefaultQueue();
      queue.add(ofy().getTransaction(),
          TaskOptions.Builder.withUrl("/tasks/send_email")
              .param("type", "feedback")
              .param("email", owner)
              .param("me", user.getEmail())
              .param("videoLink", "http://talkmeup.net/dist/#/video-comment/" + videoId));
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
    final Filter videoFilter =
        new FilterPredicate("videoId", FilterOperator.EQUAL, videoId);

    Query<Response> query = ofy().load().type(Response.class)
        .limit(limit)
        .filter(videoFilter);

    Video video = ofy().load().type(Video.class).id(videoId).now();
    if (video == null) {
      LOG.warning("Video " + videoId + " does not exist!");
      return new ArrayList<>();
    }

    String videoOwner = video.getCreatedBy();
    if (videoOwner.equalsIgnoreCase(user.getEmail())) {
      return query.list();
    }

    final Filter createrFilter =
        new FilterPredicate("createdBy", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    return query.filter(createrFilter).list();
  }

  @ApiMethod(
      name = "getResponsesForUser",
      path = "getResponsesForUser",
      httpMethod = HttpMethod.POST
  )
  public List<Response> getResponsesForUser(
      final User user,
      @Named("email") @Nullable final String userEmail,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    String email = Strings.isNullOrEmpty(userEmail) ? user.getEmail() : userEmail;
    final Filter emailFilter =
        new FilterPredicate("forUser", FilterOperator.EQUAL, email.toLowerCase());

    return ofy().load().type(Response.class)
        .limit(limit)
        .filter(emailFilter)
        .list();
  }

  @ApiMethod(
      name = "getVideosForUser",
      path = "getVideosForUser",
      httpMethod = HttpMethod.POST
  )
  public List<Video> getVideosForUser(
      final User user,
      @Named("email") @Nullable final String userEmail,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    String email = Strings.isNullOrEmpty(userEmail) ? user.getEmail() : userEmail;
    final Filter emailFilter =
        new FilterPredicate("createdBy", FilterOperator.EQUAL, email.toLowerCase());

    return ofy().load().type(Video.class)
        .limit(limit)
        .filter(emailFilter)
        .list();
  }

  @ApiMethod(
      name = "getTemplate",
      path = "getTemplate",
      httpMethod = HttpMethod.POST
  )
  public Template getTemplate(@Named("id") final Long id) {
    long templateId = id;
    if (id == null || id < 0) {
      templateId = PRESENTATION_TEMPLATE_ID;
    }
    return ofy().load().type(Template.class).id(templateId).now();
  }

  @ApiMethod(
      name = "getTemplates",
      path = "getTemplates",
      httpMethod = HttpMethod.POST
  )
  public List<Template> getTemplates() {
    return ofy().load().type(Template.class).order("name").list();
  }

  @ApiMethod(
      name = "getScore",
      path = "getScore",
      httpMethod = HttpMethod.POST
  )
  public Score getScore() {
    return ofy().load().type(Score.class).id(10000L).now();
  }

  @ApiMethod(
      name = "getUploadUrl",
      path = "getUploadUrl",
      httpMethod = HttpMethod.POST
  )
  public UploadUrl getUploadUrl() {
    return new UploadUrl(ApiUtils.createVideoUploadUrl("/upload"));
  }

  @ApiMethod(
      name = "createGroup",
      path = "createGroup",
      httpMethod = HttpMethod.POST)
  public Group createGroup(
      final User user,
      @Named("name") final String name) {
    Key<Group> key = factory().allocateId(Group.class);
    Group group = new Group(key.getId(), user.getEmail().toLowerCase(), name);
    return (Group) ApiUtils.createEntity(group, Group.class);
  }

  @ApiMethod(
      name = "createGroupWithMembers",
      path = "createGroupWithMembers",
      httpMethod = HttpMethod.POST)
  public Group createGroupWithMembers(
      final User user,
      @Named("name") final String name,
      @Named("members") final List<String> members) {
    Key<Group> key = factory().allocateId(Group.class);
    Group group = new Group(key.getId(), user.getEmail().toLowerCase(), name);
    ApiUtils.createEntity(group, Group.class);
    List<Membership> membershipList = new ArrayList<>();
    for (String member : members) {
      Key<Membership> membershipKey = factory().allocateId(Membership.class);
      membershipList.add(new Membership(membershipKey.getId(), group.getId(), member.toLowerCase()));
    }
    ofy().save().entities(membershipList);
    return group;
  }

  @ApiMethod(
      name = "getGroupById",
      path = "getGroupById",
      httpMethod = HttpMethod.POST)
  public Group getGroupById(final User user, @Named("id") final Long id) {
    return ofy().load().type(Group.class).id(id).now();
  }

  @ApiMethod(
      name = "checkOwnership",
      path = "checkOwnership",
      httpMethod = HttpMethod.POST)
  public Group checkOwnership(final User user, @Named("id") final Long id)
      throws UnauthorizedException {
    return getOwnedGroupById(id, user);
  }

  @ApiMethod(
      name = "deleteGroup",
      path = "deleteGroup",
      httpMethod = HttpMethod.DELETE)
  public void deleteGroup(
      final User user,
      @Named("id") final Long id) throws UnauthorizedException {
    Group group = getOwnedGroupById(id, user);

    Set<Topic> relatedTopics = getTopicsByGroupId(id);
    ofy().delete().entities(relatedTopics);

    Set<Membership> relatedMemberships = getMembershipsByGroupId(id);
    ofy().delete().entities(relatedMemberships);

    ofy().delete().entity(group);
  }

  private Group getOwnedGroupById(final long id, final User owner) throws UnauthorizedException {
    Group group = ofy().load().type(Group.class).id(id).now();
    if (!group.getOwner().equalsIgnoreCase(owner.getEmail())) {
      throw new UnauthorizedException("User is not group owner.");
    }
    return group;
  }

  private Set<Topic> getTopicsByGroupId(long groupId) {
    Set<Topic> topics = new HashSet<>();
    final Filter groupIdFilter =
        new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
    topics.addAll(ofy().load().type(Topic.class).filter(groupIdFilter).list());
    return topics;
  }

  private Set<Membership> getMembershipsByGroupId(long groupId) {
    Set<Membership> memberships = new HashSet<>();
    final Filter groupIdFilter =
        new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
    memberships.addAll(ofy().load().type(Membership.class).filter(groupIdFilter).list());
    return memberships;
  }

  @ApiMethod(
      name = "getMyOwnedGroups",
      path = "getMyOwnedGroups",
      httpMethod = HttpMethod.POST)
  public List<Group> getMyOwnedGroups(
      final User user,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter ownerFilter =
        new FilterPredicate("owner", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    return ofy().load().type(Group.class).filter(ownerFilter).limit(limit)
        .list();
  }

  @ApiMethod(
      name = "getMyJoinedGroups",
      path = "getMyJoinedGroups",
      httpMethod = HttpMethod.POST)
  public List<Group> getMyJoinedGroups(
      final User user,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    final Filter membershipFilter =
        new FilterPredicate("user", FilterOperator.EQUAL, user.getEmail().toLowerCase());
    List<Membership> memberships =
        ofy().load().type(Membership.class).filter(membershipFilter).limit(limit).list();
    Set<Long> groupIds = new HashSet<>();
    for (Membership membership : memberships) {
      groupIds.add(membership.getGroupId());
    }
    Map<Long, Group> groupMap = ofy().load().type(Group.class).ids(groupIds);
    List<Group> groups = new ArrayList<>();
    for (Long id : groupMap.keySet()) {
      if (groupMap.get(id) != null) {
        groups.add(groupMap.get(id));
      }
    }
    return groups;
  }

  @ApiMethod(
      name = "getMembershipsForGroup",
      path = "getMembershipsForGroup",
      httpMethod = HttpMethod.POST)
  public List<Membership> getMembershipsForGroup(
      final User user,
      @Named("id") final Long groupId,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit) {
    return new ArrayList<>(getMembershipsByGroupId(groupId));
  }

  @ApiMethod(
      name = "addMember",
      path = "addMember",
      httpMethod = HttpMethod.POST)
  public Membership addMember(
      final User user,
      @Named("id") final Long groupId,
      @Named("member") final String member) throws UnauthorizedException {
    getOwnedGroupById(groupId, user);
    Key<Membership> key = factory().allocateId(Membership.class);
    Membership membership = new Membership(key.getId(), groupId, member.toLowerCase());
    return (Membership) ApiUtils.createEntity(membership, Membership.class);
  }

  @ApiMethod(
      name = "deleteMember",
      path = "deleteMember",
      httpMethod = HttpMethod.DELETE)
  public void deleteMember(
      final User user,
      @Named("groupId") final Long groupId,
      @Named("member") @Nullable String member) throws UnauthorizedException {
    if (member == null) {
      member = user.getEmail();
    }
    final Filter groupFilter =
        new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
    final Filter membershipFilter =
        new FilterPredicate("user", FilterOperator.EQUAL, member.toLowerCase());
    List<Membership> memberships =
        ofy().load().type(Membership.class).filter(groupFilter).filter(membershipFilter).list();

    Group group = ofy().load().type(Group.class).id(groupId).now();
    if (member.equalsIgnoreCase(user.getEmail())
        || group.getOwner().equalsIgnoreCase(user.getEmail())) {
      ofy().delete().entities(memberships);
    }
  }

  @ApiMethod(
      name = "getTopicsForGroup",
      path = "getTopicsForGroup",
      httpMethod = HttpMethod.POST)
  public List<Topic> getTopicsForGroup(
      final User user,
      @Named("id") final Long groupId,
      @Named("limit") @DefaultValue(DEFAULT_QUERY_LIMIT) final int limit)
      throws UnauthorizedException {
    final Filter groupFilter =
        new FilterPredicate("groupId", FilterOperator.EQUAL, groupId);
    return ofy().load().type(Topic.class).filter(groupFilter).limit(limit)
        .list();
  }

  @ApiMethod(
      name = "createTopic",
      path = "createTopic",
      httpMethod = HttpMethod.POST)
  public Topic createTopic(
      final User user,
      @Named("id") final Long groupId,
      @Named("templateId") final Long templateId,
      @Named("topic") final String name) throws UnauthorizedException {
    getOwnedGroupById(groupId, user);
    Key<Topic> key = factory().allocateId(Topic.class);
    Topic topic = new Topic(key.getId(), groupId, templateId, name);
    return (Topic) ApiUtils.createEntity(topic, Topic.class);
  }

  @ApiMethod(
      name = "deleteTopic",
      path = "deleteTopic",
      httpMethod = HttpMethod.DELETE)
  public void deleteTopic(
      final User user,
      @Named("id") final Long id) throws UnauthorizedException {
    Topic topic = ofy().load().type(Topic.class).id(id).now();
    getOwnedGroupById(topic.getGroupId(), user);
    ofy().delete().entity(topic);
  }

  @ApiMethod(
      name = "setName",
      path = "setName",
      httpMethod = HttpMethod.POST)
  public AppEngineUser setName(
      final User user,
      @Named("name") final String name) {
    AppEngineUser profile =
        ofy().load().type(AppEngineUser.class).id(user.getEmail().toLowerCase()).now();
    profile.setName(name);
    ofy().save().entity(profile);
    return profile;
  }

  @ApiMethod(
      name = "getProfilesByEmails",
      path = "getProfilesByEmails",
      httpMethod = HttpMethod.POST)
  public List<AppEngineUser> getProfilesByEmails(
      final User user,
      @Named("emails") final List<String> emails) {
    Map<String, AppEngineUser> emailToProfile = ofy().load().type(AppEngineUser.class).ids(emails);
    return new ArrayList<>(emailToProfile.values());
  }

  @ApiMethod(
      name = "getAllUsers",
      path = "getAllUsers",
      httpMethod = HttpMethod.POST)
  public List<AppEngineUser> getAllUsers() {
    return ofy().load().type(AppEngineUser.class).list();
  }
}