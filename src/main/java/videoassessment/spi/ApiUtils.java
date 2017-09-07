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
  public static final long PRESENTATION_TEMPLATE_ID = 1000L;
  public static final long JOB_INTERVIEW_TEMPLATE_ID = 1001L;
  public static final ImmutableList<String> PRESENTATION_ASSESSMENTS = ImmutableList.<String>builder()
      .add("Explains issues properly based on the audience’s expertise<->Neglects the audience’s level of expertise and uses jargon and inappropriate language")
      .add("Shows a deep understanding of the audience’s concerns<->Neglects the audience’s viewpoints")
      .add("Focuses on satisfying the audience’s decision criteria<->Satisfies the speaker's decision criteria")
      .add("Has a clear thesis and well-defined main points<->Has no structure for the argument")
      .add("Uses qualitative and quantitative support for arguments<->Lacks data to support arguments")
      .add("Speaks clearly and with verve<->Speaks quietly with little emotion or energy")
      .add("Paints vivid pictures with words<->Uses bland and ambiguous language")
      .add("Interjects relevant stories and analogies<->Relies solely on data")
      .add("Frames ideas in positive ways<->Describes things in neutral or negative terms")
      .add("Presents ideas at the appropriate pace without filler words<->Uses an inappropriate pace and frequent filler words")
      .add("Consistently maintains composure<->Is nervous, defensive or irritable")
      .add("Is comfortable and smiles warmly<->Rarely smiles")
      .add("Exudes confidence with body<->Slouches and rarely gestures")
      .add("Moves with purpose<->Plants feet and rarely moves")
      .add("Establishes eye contact with the entire audience<->Looks down, above the audience and toward a screen")
      .add("Starts with an Attention Grabber<->Has a bland introduction")
      .add("Identifies self, speaking purpose and agenda<->Does not prepare the audience for what will follow")
      .add("Asks rhetorical and non-rhetorical questions of the audience<->Does not interact with the audience")
      .add("Uses visuals effectively<->Confuses the audience with visuals")
      .add("Concludes with summaries and clear next steps for the audience<->The audience is left wondering what to do next")
      .build();

  public static final ImmutableList<String> JOB_INTERVIEW_ASSESSMENTS = ImmutableList.<String>builder()
      .add("Be poised, smile appropriately, and offer a firm handshake")
      .add("Wait to be asked to sit, then sit using good posture")
      .add("Use open gestures; nod to confirm comprehension")
      .add("Maintain eye contact with the recruiters – avoid reading")
      .add("Dress appropriately for the industry and position")
      .add("Maintain appropriate volume and breath support")
      .add("Pronounce words clearly at a moderate pace and medium pitch")
      .add("Avoid filler words and \"double clutching\"")
      .add("Use pauses and vocal stress to emphasize key points")
      .add("Vary your emotional tone")
      .add("Introduce yourself")
      .add("Show knowledge of the firm – its value, people, and current position")
      .add("Explain how your skills satisfy the job’s requirements – connect the dots")
      .add("Quantify the results and benefits you created in the past")
      .add("Give direct, specific, and complete answers – avoid banalities")
      .add("Tell your story – why you applied for the program and the interview")
      .add("Do not correct the interviewers (e.g., “As I said”) or interrupt")
      .add("Be diplomatic – avoid criticizing anyone, even yourself")
      .add("Express your enthusiasm for the position")
      .add("Exit with a sincere thank you and handshake")
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
