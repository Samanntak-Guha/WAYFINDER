import os
import json
import gzip
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("wayfinder.rxr_adapter")

# Benchmark sample instructions across English, Hindi, and Telugu for bundled environments
SAMPLE_RXR_INSTRUCTIONS = [
    # English
    {
        "id": "rxr_en_001",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_unseen",
        "language": "en",
        "instruction_text": "Walk straight through the main corridor, turn left into the living room, pass the linen sofa, and stop in front of the travertine fire hearth.",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_07",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_06", "vp_07"],
        "extracted_landmarks": ["main corridor", "living room", "linen sofa", "travertine fire hearth"]
    },
    {
        "id": "rxr_en_002",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_seen",
        "language": "en",
        "instruction_text": "Leave the entrance, head straight along the corridor past the central intersection, turn right toward the kitchen island, and halt by the induction cooktop.",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_11",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_09", "vp_10", "vp_11"],
        "extracted_landmarks": ["entrance", "corridor", "kitchen island", "induction cooktop"]
    },
    # Hindi (room-across-room official language subset)
    {
        "id": "rxr_hi_001",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_unseen",
        "language": "hi",
        "instruction_text": "प्रवेश द्वार से सीधे गलियारे में चलें, केंद्रीय चौराहे से बाएं बैठक (लिविंग रूम) की ओर मुड़ें और सोफे के पास रुकें।",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_07",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_06", "vp_07"],
        "extracted_landmarks": ["प्रवेश द्वार", "गलियारा", "बैठक", "सोफा"]
    },
    {
        "id": "rxr_hi_002",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_seen",
        "language": "hi",
        "instruction_text": "हॉलवे से सीधे आगे बढ़ें, डाइनिंग टेबल को पार करके रसोई में जाएं और स्टोन काउंटर के पास रुक जाएं।",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_10",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_09", "vp_10"],
        "extracted_landmarks": ["हॉलवे", "डाइनिंग टेबल", "रसोई", "स्टोन काउंटर"]
    },
    # Telugu (multilingual benchmark subset)
    {
        "id": "rxr_te_001",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_unseen",
        "language": "te",
        "instruction_text": "ప్రవేశ ద్వారం నుండి కారిడార్ గుండా తిన్నగా వెళ్ళండి, మధ్య కూడలి వద్ద ఎడమవైపు లివింగ్ రూమ్‌కి తిరిగి, సోఫా వద్ద ఆగండి.",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_07",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_06", "vp_07"],
        "extracted_landmarks": ["ప్రవేశ ద్వారం", "కారిడార్", "లివింగ్ రూమ్", "సోఫా"]
    },
    {
        "id": "rxr_te_002",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_residence_01",
        "split_name": "val_seen",
        "language": "te",
        "instruction_text": "కారిడార్ గుండా ముందుకు వెళ్లి, కుడివైపు తిరిగి వంటగది లోపలికి ప్రవేశించి, కిచెన్ ఐలాండ్ వద్ద ఆగండి.",
        "start_viewpoint_id": "vp_01",
        "goal_viewpoint_id": "vp_10",
        "ground_truth_path": ["vp_01", "vp_02", "vp_03", "vp_09", "vp_10"],
        "extracted_landmarks": ["కారిడార్", "వంటగది", "కిచెన్ ఐలాండ్"]
    },
    # Gallery instructions
    {
        "id": "rxr_en_g01",
        "dataset_id": "rxr_benchmark",
        "environment_id": "env_gallery_02",
        "split_name": "val_unseen",
        "language": "en",
        "instruction_text": "Walk through the main atrium, proceed north towards the sculpture court, and stop in front of the marble installation.",
        "start_viewpoint_id": "vp_g01",
        "goal_viewpoint_id": "vp_g10",
        "ground_truth_path": ["vp_g01", "vp_g02", "vp_g03", "vp_g10"],
        "extracted_landmarks": ["main atrium", "sculpture court", "marble installation"]
    }
]

class RxRDatasetAdapter:
    """Adapter for Google Room-Across-Room (RxR) multilingual dataset."""

    def __init__(self, dataset_dir: Optional[str] = None):
        self.dataset_dir = dataset_dir or os.getenv("RXR_DATASET_DIR", "./data/rxr")

    def get_registered_datasets(self) -> List[Dict[str, Any]]:
        is_official_downloaded = os.path.exists(os.path.join(self.dataset_dir, "rxr_val_unseen_guide.jsonl.gz"))
        return [
            {
                "id": "rxr_benchmark",
                "name": "Google Room-Across-Room (RxR) Benchmark",
                "description": "Multilingual Vision-and-Language Navigation benchmark covering English, Hindi, and Telugu across 3D photorealistic scans.",
                "version": "1.0",
                "total_instructions": 126400 if is_official_downloaded else len(SAMPLE_RXR_INSTRUCTIONS),
                "total_environments": 90 if is_official_downloaded else 3,
                "languages": ["en", "hi", "te"],
                "license": "CC-BY-4.0 / Google Research",
                "is_available": True,
                "is_official_downloaded": is_official_downloaded,
                "status": "ready" if is_official_downloaded else "ready_with_bundled_benchmark_split"
            },
            {
                "id": "matterport3d_scans",
                "name": "Matterport3D Spatial Scans",
                "description": "RGB-D panos, reconstructed meshes, and viewpoint connectivity graphs from 90 building-scale environments.",
                "version": "v1.0",
                "total_instructions": 0,
                "total_environments": 90,
                "languages": [],
                "license": "Matterport3D Terms of Use (Academic / Research Non-Commercial)",
                "is_available": False,
                "is_official_downloaded": False,
                "status": "requires_user_academic_agreement"
            }
        ]

    def get_sample_instructions(
        self,
        environment_id: Optional[str] = None,
        language: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        results = SAMPLE_RXR_INSTRUCTIONS
        if environment_id:
            results = [i for i in results if i["environment_id"] == environment_id]
        if language:
            results = [i for i in results if i["language"] == language]
        return results
