import math
from typing import Dict, Any, List
from backend.app.ai.graph.environment_graph import EnvironmentGraph

def get_bundled_environments_metadata() -> List[Dict[str, Any]]:
    return [
        {
            "id": "env_residence_01",
            "name": "Modern Minimalist Villa",
            "category": "architectural_simulated",
            "scene_type": "residential",
            "description": "High-fidelity research environment designed with Scandinavian minimalism, concrete accents, and spatial landmarks.",
            "floor_area": 195.0,
            "total_viewpoints": 18,
            "total_edges": 32,
            "preview_image_url": "/environments/residence_preview.jpg",
            "is_downloaded": True,
            "status": "ready",
            "metadata_json": {
                "floors": 1,
                "architectural_style": "Brutalist Minimalist",
                "lighting": "Natural diffuse skylight",
                "coordinate_system": "Cartesian (meters)"
            }
        },
        {
            "id": "env_gallery_02",
            "name": "Pavilion of Contemporary Art",
            "category": "architectural_simulated",
            "scene_type": "museum_gallery",
            "description": "Spacious cultural exhibition pavilion featuring open atriums, sculpture corridors, and curated visual focal points.",
            "floor_area": 310.0,
            "total_viewpoints": 15,
            "total_edges": 26,
            "preview_image_url": "/environments/gallery_preview.jpg",
            "is_downloaded": True,
            "status": "ready",
            "metadata_json": {
                "floors": 1,
                "architectural_style": "Museum Contemporary",
                "lighting": "Spotlight & Linear LED",
                "coordinate_system": "Cartesian (meters)"
            }
        },
        {
            "id": "env_loft_03",
            "name": "Architectural Studio Penthouse",
            "category": "architectural_simulated",
            "scene_type": "loft",
            "description": "Industrial loft apartment with timber ceilings, partition screens, kitchen island, and terrace overlook.",
            "floor_area": 160.0,
            "total_viewpoints": 12,
            "total_edges": 20,
            "preview_image_url": "/environments/loft_preview.jpg",
            "is_downloaded": True,
            "status": "ready",
            "metadata_json": {
                "floors": 1,
                "architectural_style": "Industrial Loft",
                "lighting": "Warm ambient",
                "coordinate_system": "Cartesian (meters)"
            }
        }
    ]

def build_residence_graph() -> EnvironmentGraph:
    """Build high-fidelity graph for Modern Minimalist Villa (env_residence_01)."""
    g = EnvironmentGraph("env_residence_01")

    # Viewpoints: (id, x, y, z, heading, room_label, visual_features)
    viewpoints = [
        ("vp_01", 0.0, 0.0, 0.0, 0.0, "entrance_foyer", {
            "room_label": "entrance_foyer",
            "detected_objects": ["wooden_front_door", "recessed_wall_light", "stone_bench"],
            "ambient_lux": 350
        }),
        ("vp_02", 0.0, 0.0, 2.5, 0.0, "main_corridor_north", {
            "room_label": "main_corridor",
            "detected_objects": ["minimalist_wall_art", "linear_ceiling_light", "door"],
            "ambient_lux": 400
        }),
        ("vp_03", 0.0, 0.0, 5.0, 0.0, "central_intersection", {
            "room_label": "central_intersection",
            "detected_objects": ["polished_concrete_floor", "skylight", "archway"],
            "ambient_lux": 600
        }),
        ("vp_04", 0.0, 0.0, 7.5, 0.0, "main_corridor_south", {
            "room_label": "main_corridor",
            "detected_objects": ["recessed_bookshelf", "bronze_sculpture"],
            "ambient_lux": 420
        }),
        ("vp_05", 0.0, 0.0, 10.0, 0.0, "terrace_corridor", {
            "room_label": "terrace_corridor",
            "detected_objects": ["floor_to_ceiling_glass_door", "potted_olive_tree"],
            "ambient_lux": 750
        }),
        # East Wing: Grand Living Room & Lounge
        ("vp_06", 3.0, 0.0, 3.5, 90.0, "living_room_entry", {
            "room_label": "living_room",
            "detected_objects": ["low_profile_linen_sofa", "oak_credenza", "coffee_table"],
            "ambient_lux": 500
        }),
        ("vp_07", 6.0, 0.0, 3.5, 90.0, "living_room_center", {
            "room_label": "living_room",
            "detected_objects": ["travertine_fire_hearth", "curved_armchair", "wool_rug"],
            "ambient_lux": 520
        }),
        ("vp_08", 6.0, 0.0, 6.5, 180.0, "living_room_terrace_view", {
            "room_label": "living_room",
            "detected_objects": ["panoramic_window", "marble_side_table"],
            "ambient_lux": 650
        }),
        # West Wing: Kitchen Island & Dining Pavilion
        ("vp_09", -3.0, 0.0, 3.5, 270.0, "dining_pavilion", {
            "room_label": "dining_area",
            "detected_objects": ["solid_oak_dining_table", "sculptural_pendant_light", "chairs"],
            "ambient_lux": 480
        }),
        ("vp_10", -6.0, 0.0, 3.5, 270.0, "kitchen_entry", {
            "room_label": "kitchen",
            "detected_objects": ["monolithic_stone_island", "recessed_sink", "cabinets"],
            "ambient_lux": 550
        }),
        ("vp_11", -6.0, 0.0, 6.0, 180.0, "kitchen_workstation", {
            "room_label": "kitchen",
            "detected_objects": ["induction_cooktop", "concealed_refrigerator", "pantry_door"],
            "ambient_lux": 580
        }),
        # North-West Wing: Study / Library
        ("vp_12", -3.0, 0.0, 0.0, 270.0, "study_entrance", {
            "room_label": "study_library",
            "detected_objects": ["fluted_glass_door", "walnut_desk"],
            "ambient_lux": 380
        }),
        ("vp_13", -5.5, 0.0, 0.0, 270.0, "study_inner", {
            "room_label": "study_library",
            "detected_objects": ["floor_to_ceiling_library_shelves", "leather_reading_chair"],
            "ambient_lux": 360
        }),
        # South Wing: Master Bedroom Suite
        ("vp_14", 3.0, 0.0, 8.5, 90.0, "suite_anteroom", {
            "room_label": "master_suite",
            "detected_objects": ["timber_sliding_panel", "warm_wall_sconce"],
            "ambient_lux": 320
        }),
        ("vp_15", 6.0, 0.0, 9.5, 90.0, "master_bedroom", {
            "room_label": "master_bedroom",
            "detected_objects": ["platform_king_bed", "acoustic_linen_headboard", "curtains"],
            "ambient_lux": 300
        }),
        ("vp_16", 6.0, 0.0, 12.0, 180.0, "en_suite_bathroom", {
            "room_label": "bathroom",
            "detected_objects": ["freestanding_stone_bathtub", "double_vanity", "mirror"],
            "ambient_lux": 450
        }),
        # Outdoor Terrace & Courtyard
        ("vp_17", 0.0, 0.0, 13.0, 0.0, "sunken_terrace", {
            "room_label": "outdoor_terrace",
            "detected_objects": ["weathered_concrete_pavers", "built_in_seating_well"],
            "ambient_lux": 900
        }),
        ("vp_18", -3.0, 0.0, 13.0, 270.0, "zen_courtyard", {
            "room_label": "courtyard",
            "detected_objects": ["sculptural_bonsai_pine", "gravel_zen_garden"],
            "ambient_lux": 950
        })
    ]

    for vp_id, x, y, z, heading, room, feat in viewpoints:
        g.add_viewpoint(vp_id, x, y, z, heading, room, feat)

    # Connections / Walkable Edges
    edges = [
        ("vp_01", "vp_02"),
        ("vp_02", "vp_03"),
        ("vp_03", "vp_04"),
        ("vp_04", "vp_05"),
        # Connect corridor to living room
        ("vp_03", "vp_06"),
        ("vp_06", "vp_07"),
        ("vp_07", "vp_08"),
        ("vp_04", "vp_08"),
        # Connect corridor to dining & kitchen
        ("vp_03", "vp_09"),
        ("vp_09", "vp_10"),
        ("vp_10", "vp_11"),
        ("vp_04", "vp_11"),
        # Connect entrance to study
        ("vp_01", "vp_12"),
        ("vp_12", "vp_13"),
        # Connect south corridor to master suite
        ("vp_04", "vp_14"),
        ("vp_14", "vp_15"),
        ("vp_15", "vp_16"),
        # Connect terrace corridor to outdoor
        ("vp_05", "vp_17"),
        ("vp_17", "vp_18"),
        ("vp_05", "vp_18"),
        # Additional loops for realistic multi-path navigation
        ("vp_02", "vp_06"),
        ("vp_02", "vp_09")
    ]

    for u, v in edges:
        g.add_edge(u, v)

    return g

def build_gallery_graph() -> EnvironmentGraph:
    """Build graph for Pavilion of Contemporary Art (env_gallery_02)."""
    g = EnvironmentGraph("env_gallery_02")
    vps = [
        ("vp_g01", 0.0, 0.0, 0.0, 0.0, "atrium_entrance", {"room_label": "atrium", "detected_objects": ["ticket_desk", "monumental_staircase"]}),
        ("vp_g02", 0.0, 0.0, 4.0, 0.0, "central_atrium", {"room_label": "atrium", "detected_objects": ["kinetic_mobile_sculpture", "glass_dome"]}),
        ("vp_g03", 0.0, 0.0, 8.0, 0.0, "rotunda_crossway", {"room_label": "rotunda", "detected_objects": ["circular_bench", "direction_kiosk"]}),
        ("vp_g04", 4.0, 0.0, 4.0, 90.0, "gallery_east_entry", {"room_label": "gallery_east", "detected_objects": ["large_oil_canvas", "barrier_cord"]}),
        ("vp_g05", 8.0, 0.0, 4.0, 90.0, "gallery_east_inner", {"room_label": "gallery_east", "detected_objects": ["sculpture_pedestal", "spotlight"]}),
        ("vp_g06", 8.0, 0.0, 8.0, 180.0, "gallery_east_annex", {"room_label": "gallery_east", "detected_objects": ["bronze_bust", "wall_text"]}),
        ("vp_g07", -4.0, 0.0, 4.0, 270.0, "gallery_west_entry", {"room_label": "gallery_west", "detected_objects": ["interactive_touchscreen", "display_case"]}),
        ("vp_g08", -8.0, 0.0, 4.0, 270.0, "gallery_west_media", {"room_label": "media_hall", "detected_objects": ["video_projection_wall", "dark_curtains"]}),
        ("vp_g09", -8.0, 0.0, 8.0, 180.0, "sound_installation", {"room_label": "media_hall", "detected_objects": ["directional_speakers", "bench"]}),
        ("vp_g10", 0.0, 0.0, 12.0, 0.0, "sculpture_court", {"room_label": "sculpture_court", "detected_objects": ["marble_installation", "glass_wall"]}),
        ("vp_g11", 4.0, 0.0, 12.0, 90.0, "observation_terrace", {"room_label": "terrace", "detected_objects": ["balcony_railing", "skyline_view"]}),
        ("vp_g12", -4.0, 0.0, 12.0, 270.0, "curator_pavilion", {"room_label": "curator_hall", "detected_objects": ["archive_cabinet", "reading_table"]}),
        ("vp_g13", 0.0, 0.0, -3.0, 180.0, "exterior_forecourt", {"room_label": "forecourt", "detected_objects": ["reflecting_pool", "stone_monolith"]}),
        ("vp_g14", 4.0, 0.0, 0.0, 90.0, "museum_store", {"room_label": "museum_store", "detected_objects": ["book_shelves", "glass_counter"]}),
        ("vp_g15", -4.0, 0.0, 0.0, 270.0, "cafe_veranda", {"room_label": "cafe", "detected_objects": ["espresso_bar", "bistro_tables"]})
    ]
    for vp_id, x, y, z, h, r, f in vps:
        g.add_viewpoint(vp_id, x, y, z, h, r, f)

    edges = [
        ("vp_g01", "vp_g02"), ("vp_g02", "vp_g03"), ("vp_g03", "vp_g10"),
        ("vp_g02", "vp_g04"), ("vp_g04", "vp_g05"), ("vp_g05", "vp_g06"), ("vp_g03", "vp_g06"),
        ("vp_g02", "vp_g07"), ("vp_g07", "vp_g08"), ("vp_g08", "vp_g09"), ("vp_g03", "vp_g09"),
        ("vp_g10", "vp_g11"), ("vp_g10", "vp_g12"),
        ("vp_g01", "vp_g13"), ("vp_g01", "vp_g14"), ("vp_g01", "vp_g15"),
        ("vp_g06", "vp_g11"), ("vp_g09", "vp_g12")
    ]
    for u, v in edges:
        g.add_edge(u, v)
    return g

def build_loft_graph() -> EnvironmentGraph:
    """Build graph for Architectural Studio Penthouse (env_loft_03)."""
    g = EnvironmentGraph("env_loft_03")
    vps = [
        ("vp_l01", 0.0, 0.0, 0.0, 0.0, "loft_entryway", {"room_label": "entry", "detected_objects": ["steel_coat_rack", "key_console"]}),
        ("vp_l02", 0.0, 0.0, 3.0, 0.0, "open_gallery", {"room_label": "open_gallery", "detected_objects": ["timber_post", "exposed_brick_wall"]}),
        ("vp_l03", 3.0, 0.0, 3.0, 90.0, "living_loft", {"room_label": "living_room", "detected_objects": ["modular_charcoal_sofa", "coffee_table"]}),
        ("vp_l04", 6.0, 0.0, 3.0, 90.0, "media_corner", {"room_label": "living_room", "detected_objects": ["hi_fi_sound_system", "bookshelf"]}),
        ("vp_l05", -3.0, 0.0, 3.0, 270.0, "open_kitchen", {"room_label": "kitchen", "detected_objects": ["stainless_steel_island", "bar_stools"]}),
        ("vp_l06", -6.0, 0.0, 3.0, 270.0, "dining_nook", {"room_label": "dining", "detected_objects": ["reclaimed_wood_table", "pendants"]}),
        ("vp_l07", 0.0, 0.0, 6.0, 0.0, "mezzanine_stair_base", {"room_label": "hallway", "detected_objects": ["spiral_steel_stairs", "gallery_wall"]}),
        ("vp_l08", 3.0, 0.0, 6.0, 90.0, "bedroom_alcove", {"room_label": "bedroom", "detected_objects": ["platform_bed", "linen_screen"]}),
        ("vp_l09", 6.0, 0.0, 6.0, 90.0, "walk_in_closet", {"room_label": "closet", "detected_objects": ["wardrobe_racks", "mirror"]}),
        ("vp_l10", -3.0, 0.0, 6.0, 270.0, "loft_bathroom", {"room_label": "bathroom", "detected_objects": ["concrete_basin", "walk_in_shower"]}),
        ("vp_l11", 0.0, 0.0, 9.0, 0.0, "terrace_doors", {"room_label": "terrace", "detected_objects": ["industrial_glass_doors", "planter"]}),
        ("vp_l12", 0.0, 0.0, 12.0, 0.0, "rooftop_deck", {"room_label": "terrace", "detected_objects": ["teak_loungers", "fire_pit"]})
    ]
    for vp_id, x, y, z, h, r, f in vps:
        g.add_viewpoint(vp_id, x, y, z, h, r, f)

    edges = [
        ("vp_l01", "vp_l02"), ("vp_l02", "vp_l03"), ("vp_l03", "vp_l04"),
        ("vp_l02", "vp_l05"), ("vp_l05", "vp_l06"),
        ("vp_l02", "vp_l07"), ("vp_l07", "vp_l08"), ("vp_l08", "vp_l09"),
        ("vp_l07", "vp_l10"), ("vp_l07", "vp_l11"), ("vp_l11", "vp_l12"),
        ("vp_l03", "vp_l08"), ("vp_l05", "vp_l10")
    ]
    for u, v in edges:
        g.add_edge(u, v)
    return g

_GRAPH_CACHE: Dict[str, EnvironmentGraph] = {}

def get_environment_graph(env_id: str) -> EnvironmentGraph:
    if env_id in _GRAPH_CACHE:
        return _GRAPH_CACHE[env_id]

    if env_id == "env_residence_01":
        graph = build_residence_graph()
    elif env_id == "env_gallery_02":
        graph = build_gallery_graph()
    elif env_id == "env_loft_03":
        graph = build_loft_graph()
    else:
        # Fallback to residence
        graph = build_residence_graph()

    _GRAPH_CACHE[env_id] = graph
    return graph
