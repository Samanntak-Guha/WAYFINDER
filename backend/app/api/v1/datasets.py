import os
from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from backend.app.environments.rxr_dataset_adapter import RxRDatasetAdapter

router = APIRouter(prefix="/datasets", tags=["Datasets"])
rxr_adapter = RxRDatasetAdapter()

class RegisterDatasetRequest(BaseModel):
    dataset_id: str
    local_path: str
    license_confirmed: bool

@router.get("", response_model=List[Dict[str, Any]])
async def list_datasets():
    return rxr_adapter.get_registered_datasets()

@router.get("/{dataset_id}/instructions")
async def get_instructions(
    dataset_id: str,
    environment_id: Optional[str] = Query(None),
    language: Optional[str] = Query(None)
):
    instructions = rxr_adapter.get_sample_instructions(
        environment_id=environment_id,
        language=language
    )
    return instructions

@router.post("/register-local")
async def register_local_dataset(req: RegisterDatasetRequest):
    if not req.license_confirmed:
        raise HTTPException(
            status_code=400,
            detail="You must confirm compliance with the dataset license and terms of use."
        )
    exists = os.path.exists(req.local_path)
    return {
        "status": "registered",
        "dataset_id": req.dataset_id,
        "path": req.local_path,
        "is_valid_path": exists,
        "message": f"Dataset directory registered. Verified: {exists}"
    }
