package main.java.videoassessment.service;

import com.googlecode.objectify.Objectify;
import com.googlecode.objectify.ObjectifyFactory;
import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.impl.translate.opt.joda.JodaTimeTranslators;

import main.java.videoassessment.domain.AppEngineUser;
import main.java.videoassessment.domain.Group;
import main.java.videoassessment.domain.Invitation;
import main.java.videoassessment.domain.Membership;
import main.java.videoassessment.domain.Response;
import main.java.videoassessment.domain.Score;
import main.java.videoassessment.domain.Template;
import main.java.videoassessment.domain.Topic;
import main.java.videoassessment.domain.Video;

/**
 * Custom Objectify Service that this application should use.
 */
public class OfyService {
    /**
     * This static block ensure the entity registration.
     */
    static {
        JodaTimeTranslators.add(factory());

        factory().register(AppEngineUser.class);
        factory().register(Response.class);
        factory().register(Template.class);
        factory().register(Video.class);
        factory().register(Invitation.class);
        factory().register(Group.class);
        factory().register(Topic.class);
        factory().register(Membership.class);
        factory().register(Score.class);
    }

    /**
     * Use this static method for getting the Objectify service object in order to make sure the
     * above static block is executed before using Objectify.
     * @return Objectify service object.
     */
    public static Objectify ofy() {
        return ObjectifyService.ofy();
    }

    /**
     * Use this static method for getting the Objectify service factory.
     * @return ObjectifyFactory.
     */
    public static ObjectifyFactory factory() {
        return ObjectifyService.factory();
    }
}
