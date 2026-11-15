import json
import logging
from typing import Dict, List
from fastapi import WebSocket

logger = logging.getLogger("wayfinder.websocket")

class ConnectionManager:
    def __init__(self):
        # Maps episode_id -> List[WebSocket]
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, episode_id: str, websocket: WebSocket):
        await websocket.accept()
        if episode_id not in self.active_connections:
            self.active_connections[episode_id] = []
        self.active_connections[episode_id].append(websocket)
        logger.info(f"WebSocket connected for episode {episode_id}. Active: {len(self.active_connections[episode_id])}")

    def disconnect(self, episode_id: str, websocket: WebSocket):
        if episode_id in self.active_connections:
            if websocket in self.active_connections[episode_id]:
                self.active_connections[episode_id].remove(websocket)
            if not self.active_connections[episode_id]:
                del self.active_connections[episode_id]
        logger.info(f"WebSocket disconnected for episode {episode_id}")

    async def broadcast(self, episode_id: str, message: dict):
        if episode_id in self.active_connections:
            data_str = json.dumps(message)
            dead_connections = []
            for connection in self.active_connections[episode_id]:
                try:
                    await connection.send_text(data_str)
                except Exception as e:
                    logger.warning(f"Error sending message to websocket: {e}")
                    dead_connections.append(connection)
            
            for dead in dead_connections:
                if dead in self.active_connections[episode_id]:
                    self.active_connections[episode_id].remove(dead)

ws_manager = ConnectionManager()
