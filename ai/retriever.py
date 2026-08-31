import json
import os


# =========================================================
# CIVIC KNOWLEDGE RETRIEVER
# =========================================================

class CivicKnowledgeRetriever:

    def __init__(self):

        # -------------------------------------------------
        # PROJECT ROOT
        # -------------------------------------------------

        project_root = os.path.dirname(
            os.path.dirname(
                os.path.abspath(__file__)
            )
        )

        # -------------------------------------------------
        # KNOWLEDGE BASE PATH
        # -------------------------------------------------

        knowledge_file = os.path.join(
            project_root,
            "knowledge_base",
            "civic_knowledge.json"
        )

        # -------------------------------------------------
        # LOAD KNOWLEDGE BASE
        # -------------------------------------------------

        try:

            with open(
                knowledge_file,
                "r",
                encoding="utf-8"
            ) as file:

                self.knowledge = json.load(file)

            print(
                "✅ Civic knowledge base loaded successfully."
            )

        except FileNotFoundError:

            print(
                "❌ civic_knowledge.json not found."
            )

            self.knowledge = {}

        except json.JSONDecodeError:

            print(
                "❌ Invalid JSON format in civic_knowledge.json."
            )

            self.knowledge = {}


    # =====================================================
    # RETRIEVE CIVIC INFORMATION
    # =====================================================

    def retrieve(self, issue):

        if not issue:

            return None


        # -------------------------------------------------
        # NORMALIZE ISSUE NAME
        # -------------------------------------------------

        issue_key = (
            str(issue)
            .lower()
            .strip()
            .replace("-", " ")
        )


        # -------------------------------------------------
        # DIRECT MATCH
        # -------------------------------------------------

        if issue_key in self.knowledge:

            return self.knowledge[issue_key]


        # -------------------------------------------------
        # CIVIC ISSUE ALIASES
        # -------------------------------------------------

        issue_aliases = {

            # ---------------------------------------------
            # POTHOLE
            # ---------------------------------------------

            "pothole": "pothole",

            "potholes": "pothole",

            "road pothole": "pothole",

            "road potholes": "pothole",


            # ---------------------------------------------
            # DAMAGED STREETLIGHT
            # ---------------------------------------------

            "streetlight": "damaged_streetlight",

            "street light": "damaged_streetlight",

            "damaged streetlight": "damaged_streetlight",

            "damaged street light": "damaged_streetlight",

            "broken streetlight": "damaged_streetlight",

            "broken street light": "damaged_streetlight",

            "faulty streetlight": "damaged_streetlight",

            "non functional streetlight": "damaged_streetlight",

            "non functional street light": "damaged_streetlight",


            # ---------------------------------------------
            # WATER LEAKAGE
            # ---------------------------------------------

            "water leakage": "water_leakage",

            "water leak": "water_leakage",

            "water leaking": "water_leakage",

            "leaking water": "water_leakage",

            "water leakages": "water_leakage",


            # ---------------------------------------------
            # GARBAGE MANAGEMENT
            # ---------------------------------------------

            "garbage": "garbage",

            "garbage management": "garbage",

            "waste": "garbage",

            "waste management": "garbage",

            "solid waste": "garbage",

            "garbage accumulation": "garbage",

            "accumulated garbage": "garbage",

            "garbage dumping": "garbage",

            "waste dumping": "garbage",

            "dumped garbage": "garbage",

            "trash": "garbage",

            "litter": "garbage"

        }


        # -------------------------------------------------
        # FIND MAPPED ISSUE
        # -------------------------------------------------

        mapped_issue = issue_aliases.get(
            issue_key
        )


        if mapped_issue:

            return self.knowledge.get(
                mapped_issue
            )


        # -------------------------------------------------
        # PARTIAL MATCH
        # -------------------------------------------------

        for alias, mapped_issue in issue_aliases.items():

            if alias in issue_key:

                return self.knowledge.get(
                    mapped_issue
                )


        # -------------------------------------------------
        # NO MATCH
        # -------------------------------------------------

        print(
            f"⚠️ No civic information found for: {issue}"
        )

        return None


# =========================================================
# TEST RETRIEVER
# =========================================================

if __name__ == "__main__":

    retriever = CivicKnowledgeRetriever()


    test_issues = [

        "pothole",

        "damaged streetlight",

        "water leakage",

        "garbage",

        "waste",

        "garbage management"

    ]


    print(
        "\n=========================================="
    )

    print(
        "CIVIC KNOWLEDGE RETRIEVER TEST"
    )

    print(
        "=========================================="
    )


    for issue in test_issues:

        result = retriever.retrieve(
            issue
        )


        print(
            f"\n🔎 Issue: {issue}"
        )

        print(
            "📚 Retrieved Information:"
        )

        print(
            result
        )