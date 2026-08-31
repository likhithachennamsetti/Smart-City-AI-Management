import os
import shutil

from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel

from ai.civic_detector import CivicDetector
from ai.civic_classifier import CivicClassifier
from ai.retriever import CivicKnowledgeRetriever


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/ai",
    tags=["AI Analyzer"]
)


# =========================================================
# LOAD AI MODELS
# =========================================================

detector = CivicDetector()
classifier = CivicClassifier()
retriever = CivicKnowledgeRetriever()


# =========================================================
# YOLO CONFIDENCE THRESHOLD
# =========================================================

YOLO_CONFIDENCE_THRESHOLD = 0.60


# =========================================================
# AI ANALYZER
# =========================================================

@router.post("/analyze")
async def analyze_civic_issue(
    image: UploadFile = File(...)
):

    project_root = os.path.dirname(
        os.path.dirname(
            os.path.abspath(__file__)
        )
    )


    upload_dir = os.path.join(
        project_root,
        "data",
        "images"
    )


    os.makedirs(
        upload_dir,
        exist_ok=True
    )


    file_path = os.path.join(
        upload_dir,
        image.filename
    )


    try:

        # =================================================
        # SAVE IMAGE
        # =================================================

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                image.file,
                buffer
            )


        # =================================================
        # STEP 1 — YOLO
        # =================================================

        detections = detector.detect(
            file_path
        )


        # =================================================
        # STEP 2 — CHECK STRONG YOLO DETECTION
        # =================================================

        strong_detections = [

            detection

            for detection in detections

            if detection.get(
                "confidence",
                0
            ) >= YOLO_CONFIDENCE_THRESHOLD

        ]


        # =================================================
        # STEP 3 — USE YOLO IF CONFIDENT
        # =================================================

        if strong_detections:

            best_detection = max(
                strong_detections,
                key=lambda item:
                    item["confidence"]
            )


            final_detection = {

                "issue":
                    best_detection["issue"],

                "confidence":
                    best_detection["confidence"],

                "detected_object":
                    best_detection.get(
                        "detected_object",
                        best_detection["issue"]
                    )

            }


            source = "YOLO"


        # =================================================
        # STEP 4 — OTHERWISE USE CLIP
        # =================================================

        else:

            classification = classifier.classify(
                file_path
            )


            final_detection = {

                "issue":
                    classification["issue"],

                "confidence":
                    classification["confidence"],

                "detected_object":
                    classification.get(
                        "raw_label",
                        classification["issue"]
                    )

            }


            source = "CLIP"


        # =================================================
        # STEP 5 — FINAL ISSUE
        # =================================================

        detected_issue = final_detection["issue"]


        # =================================================
        # STEP 6 — RETRIEVE CIVIC INFORMATION
        # =================================================

        recommendation = retriever.retrieve(
            detected_issue
        )


        # =================================================
        # STEP 7 — BUILD RESPONSE
        # =================================================

        response = {

            "filename":
                image.filename,

            "detected_issues": [
                final_detection
            ],

            "source":
                source,

            "issue":
                detected_issue,

            "confidence":
                final_detection["confidence"],

            "recommendation":
                recommendation

        }


        return response


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# =========================================================
# AI ASSISTANT
# =========================================================


class AssistantRequest(BaseModel):

    question: str


@router.post("/assistant")
async def ai_assistant(
    request: AssistantRequest
):

    question = request.question.strip()


    if not question:

        raise HTTPException(
            status_code=400,
            detail="Please enter a question."
        )


    # =====================================================
    # IDENTIFY CIVIC ISSUE
    # =====================================================

    question_lower = question.lower()

    detected_issue = None


    # =====================================================
    # POTHOLE / ROAD DAMAGE
    # =====================================================

    if (
        "pothole" in question_lower
        or "potholes" in question_lower
        or "road damage" in question_lower
        or "damaged road" in question_lower
    ):

        detected_issue = "pothole"


    # =====================================================
    # DAMAGED STREETLIGHT
    # =====================================================

    elif (
        "streetlight" in question_lower
        or "street light" in question_lower
        or "damaged streetlight" in question_lower
        or "broken streetlight" in question_lower
    ):

        detected_issue = "damaged_streetlight"


    # =====================================================
    # WATER LEAKAGE
    # =====================================================

    elif (
        "water leakage" in question_lower
        or "water leak" in question_lower
        or "water leaking" in question_lower
    ):

        detected_issue = "water_leakage"


    # =====================================================
    # GARBAGE MANAGEMENT
    # =====================================================

    elif (
        "garbage" in question_lower
        or "waste" in question_lower
        or "trash" in question_lower
        or "litter" in question_lower
        or "dumping" in question_lower
    ):

        detected_issue = "garbage"


    # =====================================================
    # RETRIEVE CIVIC INFORMATION
    # =====================================================

    if detected_issue:

        recommendation = retriever.retrieve(
            detected_issue
        )


        if recommendation:

            return {

                "question":
                    question,

                "issue":
                    recommendation.get(
                        "issue",
                        detected_issue
                    ),

                "answer":
                    recommendation.get(
                        "description",
                        "Civic issue information available."
                    ),

                "recommended_action":
                    recommendation.get(
                        "recommended_action",
                        ""
                    ),

                "department":
                    recommendation.get(
                        "department",
                        ""
                    ),

                "priority":
                    recommendation.get(
                        "priority",
                        ""
                    )

            }


    # =====================================================
    # GENERAL RESPONSE
    # =====================================================

    return {

        "question":
            question,

        "issue":
            None,

        "answer":
            "I can help you with civic issues related to "
            "potholes, road damage, garbage management, "
            "water leakage, and damaged streetlights. "
            "Please ask a question about one of these issues.",

        "recommended_action":
            "",

        "department":
            "",

        "priority":
            ""

    }