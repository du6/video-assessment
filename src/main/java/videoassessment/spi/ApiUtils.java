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
      .add("Does the presenter smile?")
      .add("Can you hear the presenter clearly?")
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
