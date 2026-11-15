import pytest
from backend.app.ai.language.multilingual import detect_language, extract_lexical_subgoals
from backend.app.ai.language.parser import InstructionParser

def test_language_detection():
    en_text = "Walk through the corridor and turn left."
    hi_text = "गलियारे से सीधे आगे बढ़ें और बाएं मुड़ें।"
    te_text = "కారిడార్ గుండా తిన్నగా వెళ్లి ఎడమవైపు తిరగండి."

    assert detect_language(en_text) == "en"
    assert detect_language(hi_text) == "hi"
    assert detect_language(te_text) == "te"

def test_spatial_lexicon_extraction():
    hi_text = "प्रवेश द्वार से सीधे चलो, फिर बाएं मुड़ो और बैठक में रुको।"
    subgoals = extract_lexical_subgoals(hi_text, "hi")
    assert len(subgoals) >= 2
    actions = [s["action_type"] for s in subgoals]
    assert "TURN_LEFT" in actions or "STOP" in actions

@pytest.mark.asyncio
async def test_parser_fallback_execution():
    parser = InstructionParser()
    res = await parser.parse("Walk down the hallway and stop at the kitchen.", language="en")
    assert "sub_goals" in res
    assert len(res["sub_goals"]) >= 1
    assert res["detected_language"] == "en"
