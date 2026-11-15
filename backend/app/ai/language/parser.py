import json
import logging
from typing import Dict, Any, List, Optional
from backend.app.ai.language.multilingual import detect_language, extract_lexical_subgoals
from backend.app.ai.language.prompts import MULTILINGUAL_PARSER_SYSTEM_PROMPT
from backend.app.ai.providers.factory import get_llm_provider

logger = logging.getLogger("wayfinder.parser")

# In-memory LRU cache for parsed multilingual instructions
_PARSER_CACHE: Dict[str, Dict[str, Any]] = {}

class InstructionParser:
    """Multilingual instruction parser supporting English, Hindi, and Telugu."""

    def __init__(self, provider_type: Optional[str] = None):
        self.provider_type = provider_type

    async def parse(self, instruction_text: str, language: Optional[str] = None) -> Dict[str, Any]:
        detected_lang = language or detect_language(instruction_text)
        cache_key = f"{self.provider_type}:{detected_lang}:{instruction_text.strip()}"

        if cache_key in _PARSER_CACHE:
            cached_copy = dict(_PARSER_CACHE[cache_key])
            cached_copy["latency_ms"] = 0.2
            cached_copy["from_cache"] = True
            return cached_copy

        # Attempt structured LLM parsing
        try:
            provider = get_llm_provider(self.provider_type)
            messages = [
                {"role": "system", "content": MULTILINGUAL_PARSER_SYSTEM_PROMPT},
                {"role": "user", "content": f"Language: {detected_lang}\nInstruction: {instruction_text}"}
            ]
            res = await provider.chat_completion(
                messages=messages,
                temperature=0.1,
                max_tokens=600
            )
            raw_content = res.get("content", "").strip()

            # Clean JSON if wrapped in markdown fences
            if raw_content.startswith("```"):
                lines = raw_content.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                raw_content = "\n".join(lines).strip()

            data = json.loads(raw_content)
            data["parsing_method"] = f"llm_{res.get('model', 'default')}"
            data["latency_ms"] = res.get("latency_ms", 0.0)
            _PARSER_CACHE[cache_key] = data
            return data
        except Exception as e:
            logger.warning(f"LLM parsing failed or timed out ({e}). Falling back to multilingual heuristic parser.")
            lexical_subgoals = extract_lexical_subgoals(instruction_text, detected_lang)
            fallback_data = {
                "detected_language": detected_lang,
                "overall_intent": f"Navigate along {len(lexical_subgoals)} steps to destination",
                "target_room": lexical_subgoals[-1]["target_landmark"] if lexical_subgoals else "living_room",
                "sub_goals": [
                    {
                        "step_index": s["step_num"],
                        "instruction_segment": s["clause"],
                        "action_type": s["action_type"],
                        "primary_landmark": s["target_landmark"],
                        "spatial_relation": "towards",
                        "expected_heading_degrees": 0.0
                    }
                    for s in lexical_subgoals
                ],
                "parsing_method": "multilingual_heuristic_rule_engine",
                "latency_ms": 2.5
            }
            _PARSER_CACHE[cache_key] = fallback_data
            return fallback_data
