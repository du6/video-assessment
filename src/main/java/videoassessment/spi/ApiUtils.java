package main.java.videoassessment.spi;

import static main.java.videoassessment.service.OfyService.ofy;

import com.google.api.server.spi.response.ConflictException;
import com.google.api.server.spi.response.ForbiddenException;
import com.google.api.server.spi.response.NotFoundException;
import com.google.appengine.api.blobstore.BlobstoreService;
import com.google.appengine.api.blobstore.BlobstoreServiceFactory;
import com.google.appengine.api.blobstore.UploadOptions;
import com.google.common.collect.ImmutableList;
import com.googlecode.objectify.Work;

import main.java.videoassessment.domain.Video;
import main.java.videoassessment.domain.VideoAssessmentEntity;

/**
 * Util class to help building APIs.
 */
public class ApiUtils {
  public static final long TEMPLATE_ID = 1000L;
  public static final ImmutableList<String> QUESTIONS = ImmutableList.<String>builder()
      .add("Explain the issues properly based on the audience’s background<br><-><br>Neglect the audience’s level of expertise and use a lot of jargon")
      .add("Show a deep understanding of the audience’s concerns<br><-><br>Neglect the audience’s viewpoints")
      .add("Focus on satisfying the audience’s decision criteria<br><-><br>My topic, my rules")
      .add("Test multiple options against their decision criteria<br><-><br>Assume what is best for them without proofs")
      .add("Use data to support conclusions<br><-><br>Lack of data")
      .add("Speak clearly and with verve<br><-><br>Speak quietly with little emotion or energy")
      .add("Paint a vivid picture<br><-><br>The audience need a lot of brainwork to get what you are trying to say")
      .add("Interject relevant stories and analogies<br><-><br>Rely solely on data")
      .add("Frame your ideas to engage aspirations<br><-><br>Describe things in neutral or negative terms")
      .add("Structure ideas visually<br><-><br>Only smart people can follow the logic")
      .add("Consistently maintain your composure<br><-><br>Get nervous, defensive or irritable at times")
      .add("Look at everyone and smile warmly<br><-><br>Rarely make eye contact or smile")
      .add("Exude confidence with body and voice<br><-><br>Slouch, rarely gesture, hedge or hesitate")
      .add("Speak fluently with proper speed<br><-><br>Speak too quickly or use a lot filler words")
      .add("Show respect and openness when interacting with audience<br><-><br>Show impatience or correct others when asked questions")
      .build();

  private static final String BUCKET_NAME = "video-assessment.appspot.com";

  /**
   * A wrapper class that can embrace a generic result or some kind of exception.
   *
   * Use this wrapper class for the return type of objectify transaction.
   * <pre>
   * {@code
   * // The transaction that returns KnowledgeNode object.
   * TxResult<KnowledgeNode> result = ofy().transact(new Work<TxResult<KnowledgeNode>>() {
   *     public TxResult<KnowledgeNode> run() {
   *         // Code here.
   *         // To throw 404
   *         return new TxResult<>(new NotFoundException("No such knowledge node"));
   *         // To return a knowledge node.
   *         KnowledgeNode knowledgeNode = somehow.getKnowledgeNode();
   *         return new TxResult<>(knowledgeNode);
   *     }
   * }
   * // Actually the NotFoundException will be thrown here.
   * return result.getResult();
   * </pre>
   *
   * @param <ResultType> The type of the actual return object.
   */
  public static class TxResult<ResultType> {
    private ResultType result;

    private Throwable exception;

    private TxResult(ResultType result) {
      this.result = result;
    }

    private TxResult(Throwable exception) {
      if (exception instanceof NotFoundException ||
          exception instanceof ForbiddenException ||
          exception instanceof ConflictException) {
        this.exception = exception;
      } else {
        throw new IllegalArgumentException("Exception not supported.");
      }
    }

    private ResultType getResult() throws NotFoundException, ForbiddenException, ConflictException {
      if (exception instanceof NotFoundException) {
        throw (NotFoundException) exception;
      }
      if (exception instanceof ForbiddenException) {
        throw (ForbiddenException) exception;
      }
      if (exception instanceof ConflictException) {
        throw (ConflictException) exception;
      }
      return result;
    }
  }

  public static VideoAssessmentEntity createEntity (
      final VideoAssessmentEntity videoAssessmentEntity,
      final Class<? extends VideoAssessmentEntity> entityClass) {
    // Start a transaction.
    TxResult<VideoAssessmentEntity> entity =
        ofy().transact(new Work<TxResult<VideoAssessmentEntity>>() {
      @Override
      public TxResult<VideoAssessmentEntity> run() {
        try {
          ofy().save().entity(entityClass.cast(videoAssessmentEntity)).now();
          return new TxResult<>(videoAssessmentEntity);
        } catch (Exception e) {
          return new TxResult<>(e);
        }
      }
    });
    try {
      return entityClass.cast(entity.getResult());
    } catch (Exception e) {
      throw new RuntimeException(e);
    }
  }

  public static String createVideoUploadUrl(String successPath) {
    BlobstoreService blobstoreService = BlobstoreServiceFactory.getBlobstoreService();
    return blobstoreService.createUploadUrl(successPath,
        UploadOptions.Builder.withGoogleStorageBucketName(BUCKET_NAME));
  }
}
