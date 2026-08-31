from ultralytics import YOLO
from huggingface_hub import hf_hub_download


class CivicDetector:

    def __init__(self):

        weights_path = hf_hub_download(
            repo_id="utkarsh-23/yolov8m-garbage-pothole-detector",
            filename="best.pt"
        )

        self.model = YOLO(weights_path)

        # Model classes
        self.class_names = [
            "Container",
            "Garbage",
            "crocodile crack",
            "longitudinal crack",
            "pothole",
            "HV-switch",
            "crossarm",
            "streetlight",
            "traffic-light",
            "transformer"
        ]


    def detect(self, image_path):

        results = self.model(
            image_path,
            conf=0.25
        )

        detections = []

        for result in results:

            if result.boxes is None:
                continue

            for box in result.boxes:

                class_id = int(box.cls[0])

                confidence = float(
                    box.conf[0]
                )

                if class_id < len(self.class_names):

                    class_name = self.class_names[
                        class_id
                    ]

                else:

                    class_name = f"class_{class_id}"


                # -----------------------------------------
                # MAP MODEL CLASSES TO OUR CIVIC SECTORS
                # -----------------------------------------

                if class_name in [
                    "pothole",
                    "crocodile crack",
                    "longitudinal crack"
                ]:

                    issue = "Pothole"


                elif class_name in [
                    "Garbage",
                    "Container"
                ]:

                    issue = "Garbage"


                elif class_name in [
                    "streetlight",
                    "HV-switch",
                    "crossarm",
                    "traffic-light",
                    "transformer"
                ]:

                    issue = "Streetlight"


                else:

                    issue = class_name


                detections.append({

                    "issue": issue,

                    "confidence": round(
                        confidence,
                        2
                    ),

                    "detected_object": class_name

                })


        # -----------------------------------------
        # RETURN HIGHEST CONFIDENCE DETECTION
        # -----------------------------------------

        if not detections:

            return []


        detections.sort(
            key=lambda x: x["confidence"],
            reverse=True
        )


        return [
            detections[0]
        ]


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    detector = CivicDetector()

    image_path = "data/images/garbage.jpeg"

    detections = detector.detect(
        image_path
    )

    response = {

        "image": image_path,

        "detected_issues": detections

    }

    print(
        "\nAI Detection Result:"
    )

    print(
        response
    )