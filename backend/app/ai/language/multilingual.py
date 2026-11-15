import re
from typing import Dict, List, Tuple

# Unicode ranges
DEVANAGARI_REGEX = re.compile(r'[\u0900-\u097F]')
TELUGU_REGEX = re.compile(r'[\u0C00-\u0C7F]')

# Spatial lexicon mapping across languages
SPATIAL_LEXICON = {
    "turn_left": {
        "en": ["turn left", "left", "take a left", "bear left"],
        "hi": ["बाएं मुड़ो", "बायें मुड़ें", "बाएं घूमो", "बायां", "बायें", "बाएं"],
        "te": ["ఎడమవైపు తిరగండి", "ఎడమకు తిరగండి", "ఎడమవైపు", "ఎడమ"]
    },
    "turn_right": {
        "en": ["turn right", "right", "take a right", "bear right"],
        "hi": ["दाएं मुड़ो", "दायें मुड़ें", "दाएं घूमो", "दायां", "दायें", "दाएं"],
        "te": ["కుడివైపు తిరగండి", "కుడికి తిరగండి", "కుడివైపు", "కుడి"]
    },
    "move_forward": {
        "en": ["walk straight", "go straight", "continue", "proceed", "walk down", "walk through", "advance", "head towards"],
        "hi": ["सीधे चलो", "सीधे जाओ", "आगे बढ़ो", "सीधे", "आगे"],
        "te": ["తిన్నగా వెళ్ళండి", "ముందుకు సాగండి", "ముందుకు వెళ్ళండి", "తిన్నగా", "ముందుకు"]
    },
    "stop": {
        "en": ["stop", "halt", "you have reached", "end here", "wait"],
        "hi": ["रुको", "रुकें", "पहुंच गए", "ठहरो"],
        "te": ["ఆగండి", "నిలవండి", "చేరుకున్నారు", "ఆగు"]
    },
    "landmarks": {
        "door": {
            "en": ["door", "doorway", "entrance"],
            "hi": ["दरवाजा", "दरवाजे", "प्रवेश द्वार"],
            "te": ["తలుపు", "ద్వారం", "ప్రవేశం"]
        },
        "hallway": {
            "en": ["hallway", "corridor", "hall", "passageway"],
            "hi": ["गलियारा", "हॉलवे", "गलियारे"],
            "te": ["హాల్వే", "కారిడార్", "నడవ"]
        },
        "kitchen": {
            "en": ["kitchen", "dining area", "cooking area"],
            "hi": ["रसोई", "रसोईघर", "किचन"],
            "te": ["వంటగది", "కిచెన్", "భోజనశాల"]
        },
        "living_room": {
            "en": ["living room", "lounge", "sitting room", "family room"],
            "hi": ["बैठक", "लिविंग रूम", "कमरा"],
            "te": ["హాల్", "లివింగ్ రూమ్", "గది"]
        },
        "stairs": {
            "en": ["stairs", "staircase", "steps"],
            "hi": ["सीढ़ियां", "सीढ़ी", "जीना"],
            "te": ["మెట్లు", "సోపానాలు"]
        },
        "bedroom": {
            "en": ["bedroom", "bed room", "sleeping room"],
            "hi": ["शयनकक्ष", "बेडरूम"],
            "te": ["పడుకునే గది", "బెడ్‌రూమ్"]
        },
        "bathroom": {
            "en": ["bathroom", "restroom", "washroom", "toilet"],
            "hi": ["स्नानघर", "बाथरूम", "शौचालय"],
            "te": ["స్నానాల గది", "బాత్‌రూమ్"]
        }
    }
}

def detect_language(text: str) -> str:
    """Detect whether text is English ('en'), Hindi ('hi'), or Telugu ('te')."""
    if TELUGU_REGEX.search(text):
        return "te"
    elif DEVANAGARI_REGEX.search(text):
        return "hi"
    return "en"

def normalize_text(text: str, language: str) -> str:
    """Normalize whitespace and punctuation across scripts."""
    clean = re.sub(r'[\r\n\t]+', ' ', text)
    clean = re.sub(r'[।॥!?,;]+', ' ', clean)
    clean = re.sub(r'\s+', ' ', clean).strip()
    return clean.lower() if language == "en" else clean

def extract_lexical_subgoals(text: str, language: str) -> List[Dict[str, str]]:
    """Extract semantic navigation steps using multilingual keyword detection."""
    norm = normalize_text(text, language)
    subgoals = []

    # Segment by sequence markers or punctuation clauses
    delimiters = [",", "and then", "and", "then", "continue until", "फिर", "और", "के बाद", "తర్వాత", "మరియు", "వరకు"]
    pattern = '|'.join(map(re.escape, delimiters))
    clauses = [c.strip() for c in re.split(pattern, norm, flags=re.IGNORECASE) if c.strip()]

    for i, clause in enumerate(clauses):
        action = "MOVE_FORWARD"
        target_landmark = None

        # Check action
        for syn in SPATIAL_LEXICON["turn_left"].get(language, []):
            if syn in clause:
                action = "TURN_LEFT"
                break
        if action == "MOVE_FORWARD":
            for syn in SPATIAL_LEXICON["turn_right"].get(language, []):
                if syn in clause:
                    action = "TURN_RIGHT"
                    break
        if action == "MOVE_FORWARD":
            for syn in SPATIAL_LEXICON["stop"].get(language, []):
                if syn in clause:
                    action = "STOP"
                    break

        # Check landmark
        for lmk_name, lang_dict in SPATIAL_LEXICON["landmarks"].items():
            for kw in lang_dict.get(language, []):
                if kw in clause:
                    target_landmark = lmk_name
                    break
            if target_landmark:
                break

        subgoals.append({
            "step_num": i + 1,
            "clause": clause,
            "action_type": action,
            "target_landmark": target_landmark or "corridor",
            "is_completed": False
        })

    if not subgoals:
        subgoals.append({
            "step_num": 1,
            "clause": text,
            "action_type": "MOVE_FORWARD",
            "target_landmark": "destination",
            "is_completed": False
        })

    return subgoals
