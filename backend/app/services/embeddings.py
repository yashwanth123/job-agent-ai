import os
import math
from typing import List

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None  # type: ignore


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    if not a or not b or len(a) != len(b):
        return 0.0
    dot = sum(x * y for x, y in zip(a, b))
    na = math.sqrt(sum(x * x for x in a))
    nb = math.sqrt(sum(y * y for y in b))
    if na == 0 or nb == 0:
        return 0.0
    return dot / (na * nb)


def get_embedding(text: str) -> List[float]:
    """
    Uses OpenAI embeddings if OPENAI_API_KEY is set.
    Any error -> raise RuntimeError so caller can fall back.
    """
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or OpenAI is None:
        raise RuntimeError("OpenAI embeddings not configured")

    try:
        client = OpenAI(api_key=api_key)
        resp = client.embeddings.create(
            model="text-embedding-3-small",
            input=text,
        )
        return resp.data[0].embedding  # type: ignore[no-any-return]
    except Exception as e:
        # Log and degrade gracefully
        print("[embeddings] error while getting embedding:", repr(e))
        raise RuntimeError("Embedding call failed") from e


def embedding_similarity(text_a: str, text_b: str) -> float:
    """
    Given two texts, return cosine similarity in [0,1] using embeddings.
    If embeddings are not available OR fail, returns -1 so caller can
    detect and fall back to keyword matching.
    """
    try:
        emb_a = get_embedding(text_a)
        emb_b = get_embedding(text_b)
    except RuntimeError as e:
        print("[embeddings] falling back, reason:", repr(e))
        return -1.0
    except Exception as e:
        print("[embeddings] unexpected error in embedding_similarity:", repr(e))
        return -1.0

    try:
        sim = _cosine_similarity(emb_a, emb_b)
    except Exception as e:
        print("[embeddings] error computing cosine similarity:", repr(e))
        return -1.0

    # cosine is [-1,1], normalize to [0,1]
    return max(0.0, min(1.0, (sim + 1.0) / 2.0))
