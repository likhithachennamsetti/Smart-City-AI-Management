from transformers import pipeline


class CivicClassifier:

    def __init__(self):

        print("Loading Civic AI classifier...")

        self.classifier = pipeline(
            "zero-shot-image-classification",
            model="openai/clip-vit-base-patch32"
        )

        self.candidate_labels = [

            "a photo of a pothole or damaged road",

            "a photo of garbage or accumulated waste",

            "a photo of water leakage or drainage problem",

            "a photo of a damaged streetlight",

            "a normal photo with no civic issue"
        ]


    def classify(self, image_path):

        results = self.classifier(
            image_path,
            candidate_labels=self.candidate_labels
        )

        best_result = results[0]

        label = best_result["label"]

        confidence = float(
            best_result["score"]
        )


        # =========================================
        # MAP RESULT TO PROJECT CATEGORY
        # =========================================

        if (
            "pothole" in label
            or "damaged road" in label
        ):

            issue = "Pothole"


        elif (
            "garbage" in label
            or "accumulated waste" in label
        ):

            issue = "Garbage"


        elif (
            "water leakage" in label
            or "drainage" in label
        ):

            issue = "Water"


        elif "streetlight" in label:

            issue = "Streetlight"


        else:

            issue = "No Civic Issue"


        return {

            "issue": issue,

            "confidence": round(
                confidence,
                2
            ),

            "raw_label": label
        }


# =========================================================
# TEST CLASSIFIER
# =========================================================

if __name__ == "__main__":

    classifier = CivicClassifier()


    # =============================================
    # TEST GARBAGE IMAGE
    # =============================================

    image_path = "data/images/garbage.jpeg"


    result = classifier.classify(
        image_path
    )


    print("\nAI Civic Classification Result:")

    print(result)