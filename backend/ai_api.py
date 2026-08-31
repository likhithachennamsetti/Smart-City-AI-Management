import sys
import os
import shutil

from fastapi import APIRouter, UploadFile, File, HTTPException


# =========================================================
# PROJECT ROOT
# =========================================================

PROJECT_ROOT = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)


# =========================================================
# AI MODELS
# =========================================================

from ai.civic_detector import CivicDetector
from ai.civic_classifier import CivicClassifier


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="/ai",
    tags=["AI Detection"]
)


# =========================================================
# LOAD AI MODELS
# =========================================================

detector = CivicDetector()
classifier = CivicClassifier()


# =========================================================
# YOLO CONFIDENCE THRESHOLD
# =========================================================

YOLO_CONFIDENCE_THRESHOLD = 0.60


# =========================================================
# AI CIVIC ISSUE DETECTION
# =========================================================

@router.post("/detect")
async def detect_civic_issue(
    image: UploadFile = File(...)
):

    upload_dir = os.path.join(
        PROJECT_ROOT,
        "data",
        "images"
    )

    os.makedirs(
        upload_dir,
        exist_ok=True
    )


    # =====================================================
    # SAVE IMAGE
    # =====================================================

    file_path = os.path.join(
        upload_dir,
        image.filename
    )


    try:

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                image.file,
                buffer
            )


        # =================================================
        # STEP 1
        # TRY YOLO POTHOLE DETECTION
        # =================================================

        detections = detector.detect(
            file_path
        )


        # =================================================
        # STEP 2
        # CHECK STRONG YOLO DETECTION
        # =================================================

        strong_detections = [

            detection

            for detection in detections

            if detection.get("confidence", 0)
            >= YOLO_CONFIDENCE_THRESHOLD

        ]


        # =================================================
        # STEP 3
        # ACCEPT YOLO ONLY IF CONFIDENCE IS HIGH
        # =================================================

        if strong_detections:

            best_detection = max(
                strong_detections,
                key=lambda x: x["confidence"]
            )

            return {

                "filename": image.filename,

                "detected_issues": [
                    best_detection
                ],

                "source": "YOLO",

                "issue": best_detection["issue"],

                "confidence": best_detection["confidence"]

            }


        # =================================================
        # STEP 4
        # YOLO NOT CONFIDENT
        # USE CLIP
        # =================================================

        classification = classifier.classify(
            file_path
        )


        # =================================================
        # STEP 5
        # RETURN CLIP RESULT
        # =================================================

        return {

            "filename": image.filename,

            "detected_issues": [

                {

                    "issue": classification["issue"],

                    "confidence": classification["confidence"],

                    "detected_object": classification.get(
                        "raw_label",
                        classification["issue"]
                    )

                }

            ],

            "source": "CLIP",

            "issue": classification["issue"],

            "confidence": classification["confidence"]

        }


    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )