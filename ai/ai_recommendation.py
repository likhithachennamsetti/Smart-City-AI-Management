from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ai.retriever import CivicKnowledgeRetriever


router = APIRouter(
    prefix="/ai",
    tags=["AI Recommendation"]
)


retriever = CivicKnowledgeRetriever()


class IssueRequest(BaseModel):
    issue: str


@router.post("/recommend")
def get_recommendation(
    request: IssueRequest
):

    result = retriever.retrieve(
        request.issue
    )

    if result is None:

        raise HTTPException(
            status_code=404,
            detail="No civic information found for this issue"
        )

    return result