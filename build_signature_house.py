import bpy
import bmesh
import math
import os
from mathutils import Vector, Matrix, Euler

def build_accurate_signature_house():
    print("=" * 70)
    print("BUILDING SIGNATURE ARCHITECTURAL HOUSE (REFERENCE: mm-signature-house-master.png)")
    print("=" * 70)

    # 1. Clean existing scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for block in bpy.data.meshes:
        if block.users == 0:
            bpy.data.meshes.remove(block)
    for block in bpy.data.materials:
        if block.users == 0:
            bpy.data.materials.remove(block)
    for block in bpy.data.lights:
        if block.users == 0:
            bpy.data.lights.remove(block)
    for block in bpy.data.cameras:
        if block.users == 0:
            bpy.data.cameras.remove(block)
    for block in bpy.data.collections:
        if block.name != "Master Collection":
            bpy.data.collections.remove(block)

    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.unit_settings.scale_length = 1.0

    # ------------------------------------------------------------------------
    # 2. PBR Materials Setup
    # ------------------------------------------------------------------------
    def create_material(name, base_color, roughness=0.5, metallic=0.0, transmission=0.0, ior=1.45, emission_color=(0,0,0,1), emission_strength=0.0, alpha=1.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        links = mat.node_tree.links
        nodes.clear()

        out_node = nodes.new(type='ShaderNodeOutputMaterial')
        bsdf = nodes.new(type='ShaderNodeBsdfPrincipled')

        if hasattr(bsdf.inputs['Base Color'], 'default_value'):
            bsdf.inputs['Base Color'].default_value = base_color
        
        if 'Roughness' in bsdf.inputs:
            bsdf.inputs['Roughness'].default_value = roughness
        if 'Metallic' in bsdf.inputs:
            bsdf.inputs['Metallic'].default_value = metallic

        if 'Transmission Weight' in bsdf.inputs:
            bsdf.inputs['Transmission Weight'].default_value = transmission
        elif 'Transmission' in bsdf.inputs:
            bsdf.inputs['Transmission'].default_value = transmission
            
        if 'IOR' in bsdf.inputs:
            bsdf.inputs['IOR'].default_value = ior

        if 'Emission Color' in bsdf.inputs:
            bsdf.inputs['Emission Color'].default_value = emission_color
        elif 'Emission' in bsdf.inputs:
            bsdf.inputs['Emission'].default_value = emission_color
            
        if 'Emission Strength' in bsdf.inputs:
            bsdf.inputs['Emission Strength'].default_value = emission_strength

        if 'Alpha' in bsdf.inputs:
            bsdf.inputs['Alpha'].default_value = alpha

        # Transparency blend modes
        if alpha < 1.0 or transmission > 0.1:
            if hasattr(mat, 'blend_method'):
                mat.blend_method = 'BLEND'
            if hasattr(mat, 'shadow_method'):
                mat.shadow_method = 'HASHED'

        links.new(bsdf.outputs['BSDF'], out_node.inputs['Surface'])
        return mat

    # Materials matching master reference photograph
    mat_concrete = create_material("Mat_Concrete", (0.86, 0.86, 0.85, 1.0), roughness=0.42, metallic=0.02)
    mat_concrete_dark = create_material("Mat_Concrete_Dark", (0.18, 0.19, 0.21, 1.0), roughness=0.55, metallic=0.05)
    mat_teak = create_material("Mat_TeakWood", (0.72, 0.40, 0.16, 1.0), roughness=0.30, metallic=0.0)
    mat_teak_dark = create_material("Mat_Teak_Dark", (0.42, 0.22, 0.10, 1.0), roughness=0.38, metallic=0.0)
    mat_stone_ashlar = create_material("Mat_Stone_Ashlar", (0.84, 0.74, 0.58, 1.0), roughness=0.85, metallic=0.0)
    mat_black_metal = create_material("Mat_BlackMetal", (0.05, 0.05, 0.06, 1.0), roughness=0.22, metallic=0.92)
    mat_glass = create_material("Mat_ClearGlass", (0.92, 0.96, 0.98, 1.0), roughness=0.02, transmission=0.92, ior=1.52, alpha=0.32)
    mat_glass_balustrade = create_material("Mat_Glass_Balustrade", (0.95, 0.98, 1.0, 1.0), roughness=0.01, transmission=0.95, ior=1.50, alpha=0.25)
    mat_pavers = create_material("Mat_GranitePavers", (0.24, 0.25, 0.28, 1.0), roughness=0.35, metallic=0.10)
    mat_pavers_light = create_material("Mat_GranitePavers_Light", (0.34, 0.35, 0.38, 1.0), roughness=0.38, metallic=0.08)
    mat_foliage_lush = create_material("Mat_TropicalFoliage", (0.12, 0.42, 0.15, 1.0), roughness=0.32, metallic=0.0)
    mat_foliage_bright = create_material("Mat_TropicalFoliage_Bright", (0.22, 0.56, 0.18, 1.0), roughness=0.35, metallic=0.0)
    mat_bark = create_material("Mat_TreeBark", (0.28, 0.20, 0.14, 1.0), roughness=0.88)
    mat_terracotta = create_material("Mat_Terracotta", (0.75, 0.38, 0.20, 1.0), roughness=0.65)
    mat_fabric = create_material("Mat_InteriorFabric", (0.88, 0.85, 0.80, 1.0), roughness=0.75)
    mat_sheer = create_material("Mat_SheerCurtain", (0.98, 0.98, 0.98, 1.0), roughness=0.45, transmission=0.45, alpha=0.55)
    mat_warm_light = create_material("Mat_WarmLight", (1.0, 0.82, 0.50, 1.0), roughness=0.1, emission_color=(1.0, 0.82, 0.50, 1.0), emission_strength=28.0)
    mat_signage_gold = create_material("Mat_Signage_Gold", (0.98, 0.82, 0.45, 1.0), roughness=0.12, metallic=0.95, emission_color=(1.0, 0.88, 0.58, 1.0), emission_strength=12.0)
    mat_car_body = create_material("Mat_CarBody", (0.20, 0.24, 0.28, 1.0), roughness=0.10, metallic=0.92)

    # ------------------------------------------------------------------------
    # 3. Collection & Empty Hierarchy (Guarantees GLB tree structure)
    # ------------------------------------------------------------------------
    def get_or_create_collection(name, parent_col=None):
        if name in bpy.data.collections:
            col = bpy.data.collections[name]
        else:
            col = bpy.data.collections.new(name)
            if parent_col:
                parent_col.children.link(col)
            else:
                bpy.context.scene.collection.children.link(col)
        return col

    def create_empty(name, parent_empty=None):
        empty = bpy.data.objects.new(name, None)
        empty.empty_display_type = 'PLAIN_AXES'
        empty.empty_display_size = 0.5
        bpy.context.scene.collection.objects.link(empty)
        if parent_empty:
            empty.parent = parent_empty
        return empty

    # Collections
    root_col = get_or_create_collection("House")
    col_site = get_or_create_collection("Site", root_col)
    col_foundation = get_or_create_collection("Foundation", root_col)
    col_structure = get_or_create_collection("Structure", root_col)
    col_architecture = get_or_create_collection("Architecture", root_col)
    col_envelope = get_or_create_collection("Envelope", root_col)
    col_facade = get_or_create_collection("Facade", root_col)
    col_interior = get_or_create_collection("Interior", root_col)
    col_landscape = get_or_create_collection("Landscape", root_col)

    # Sub-collections
    col_footings = get_or_create_collection("Footings", col_foundation)
    col_found_slab = get_or_create_collection("FoundationSlab", col_foundation)
    col_ground_struct = get_or_create_collection("GroundStructure", col_foundation)

    col_columns = get_or_create_collection("Columns", col_structure)
    col_beams = get_or_create_collection("Beams", col_structure)
    col_struct_slabs = get_or_create_collection("StructuralSlabs", col_structure)

    col_ground_floor = get_or_create_collection("GroundFloor", col_architecture)
    col_upper_floor = get_or_create_collection("UpperFloor", col_architecture)
    col_walls = get_or_create_collection("Walls", col_architecture)
    col_partitions = get_or_create_collection("Partitions", col_architecture)
    col_staircase = get_or_create_collection("Staircase", col_architecture)
    col_balcony = get_or_create_collection("Balcony", col_architecture)
    col_roof = get_or_create_collection("Roof", col_architecture)

    col_windows = get_or_create_collection("Windows", col_envelope)
    col_glass = get_or_create_collection("Glass", col_envelope)
    col_doors = get_or_create_collection("Doors", col_envelope)
    col_frames = get_or_create_collection("Frames", col_envelope)

    col_concrete_facade = get_or_create_collection("Concrete", col_facade)
    col_stone_facade = get_or_create_collection("Stone", col_facade)
    col_woodfins = get_or_create_collection("WoodFins", col_facade)
    col_screens = get_or_create_collection("Screens", col_facade)

    col_furniture = get_or_create_collection("Furniture", col_interior)
    col_livingroom = get_or_create_collection("LivingRoom", col_interior)
    col_kitchen = get_or_create_collection("Kitchen", col_interior)
    col_bedroom = get_or_create_collection("Bedroom", col_interior)
    col_interior_lighting = get_or_create_collection("InteriorLighting", col_interior)

    col_trees = get_or_create_collection("Trees", col_landscape)
    col_plants = get_or_create_collection("Plants", col_landscape)
    col_garden = get_or_create_collection("Garden", col_landscape)
    col_driveway = get_or_create_collection("Driveway", col_landscape)
    col_ext_lighting = get_or_create_collection("ExteriorLighting", col_landscape)

    # Empty node hierarchy for GLB tree
    emp_house = create_empty("House")
    emp_site = create_empty("Site", emp_house)
    
    emp_foundation = create_empty("Foundation", emp_house)
    emp_footings = create_empty("Footings", emp_foundation)
    emp_found_slab = create_empty("FoundationSlab", emp_foundation)
    emp_ground_struct = create_empty("GroundStructure", emp_foundation)

    emp_structure = create_empty("Structure", emp_house)
    emp_columns = create_empty("Columns", emp_structure)
    emp_beams = create_empty("Beams", emp_structure)
    emp_struct_slabs = create_empty("StructuralSlabs", emp_structure)

    emp_architecture = create_empty("Architecture", emp_house)
    emp_ground_floor = create_empty("GroundFloor", emp_architecture)
    emp_upper_floor = create_empty("UpperFloor", emp_architecture)
    emp_walls = create_empty("Walls", emp_architecture)
    emp_partitions = create_empty("Partitions", emp_architecture)
    emp_staircase = create_empty("Staircase", emp_architecture)
    emp_balcony = create_empty("Balcony", emp_architecture)
    emp_roof = create_empty("Roof", emp_architecture)

    emp_envelope = create_empty("Envelope", emp_house)
    emp_windows = create_empty("Windows", emp_envelope)
    emp_glass = create_empty("Glass", emp_envelope)
    emp_doors = create_empty("Doors", emp_envelope)
    emp_frames = create_empty("Frames", emp_envelope)

    emp_facade = create_empty("Facade", emp_house)
    emp_concrete_facade = create_empty("Concrete", emp_facade)
    emp_stone_facade = create_empty("Stone", emp_facade)
    emp_woodfins = create_empty("WoodFins", emp_facade)
    emp_screens = create_empty("Screens", emp_facade)

    emp_interior = create_empty("Interior", emp_house)
    emp_furniture = create_empty("Furniture", emp_interior)
    emp_livingroom = create_empty("LivingRoom", emp_interior)
    emp_kitchen = create_empty("Kitchen", emp_interior)
    emp_bedroom = create_empty("Bedroom", emp_interior)
    emp_interior_lighting = create_empty("InteriorLighting", emp_interior)

    emp_landscape = create_empty("Landscape", emp_house)
    emp_trees = create_empty("Trees", emp_landscape)
    emp_plants = create_empty("Plants", emp_landscape)
    emp_garden = create_empty("Garden", emp_landscape)
    emp_driveway = create_empty("Driveway", emp_landscape)
    emp_ext_lighting = create_empty("ExteriorLighting", emp_landscape)

    # ------------------------------------------------------------------------
    # 4. Geometry Helpers
    # ------------------------------------------------------------------------
    def add_box(name, size, location, material=None, collection=None, parent_empty=None):
        mesh = bpy.data.meshes.new(name + "_Mesh")
        obj = bpy.data.objects.new(name, mesh)
        
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1.0)
        bmesh.ops.scale(bm, vec=size, verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        
        obj.location = location
        if material:
            obj.data.materials.append(material)
        if collection:
            collection.objects.link(obj)
        else:
            bpy.context.scene.collection.objects.link(obj)
        if parent_empty:
            obj.parent = parent_empty
        return obj

    def add_cylinder(name, radius, depth, location, rotation=(0,0,0), vertices=24, material=None, collection=None, parent_empty=None):
        mesh = bpy.data.meshes.new(name + "_Mesh")
        obj = bpy.data.objects.new(name, mesh)
        
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, cap_tris=False, segments=vertices, radius1=radius, radius2=radius, depth=depth)
        bm.to_mesh(mesh)
        bm.free()
        
        obj.location = location
        obj.rotation_euler = rotation
        if material:
            obj.data.materials.append(material)
        if collection:
            collection.objects.link(obj)
        else:
            bpy.context.scene.collection.objects.link(obj)
        if parent_empty:
            obj.parent = parent_empty
        return obj

    def add_sphere(name, radius, scale=(1.0, 1.0, 1.0), location=(0,0,0), rotation=(0,0,0), segments=16, ring_count=12, material=None, collection=None, parent_empty=None):
        mesh = bpy.data.meshes.new(name + "_Mesh")
        obj = bpy.data.objects.new(name, mesh)
        
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=segments, v_segments=ring_count, radius=radius)
        bmesh.ops.scale(bm, vec=scale, verts=bm.verts)
        bm.to_mesh(mesh)
        bm.free()
        
        obj.location = location
        obj.rotation_euler = rotation
        if material:
            obj.data.materials.append(material)
        if collection:
            collection.objects.link(obj)
        else:
            bpy.context.scene.collection.objects.link(obj)
        if parent_empty:
            obj.parent = parent_empty
        return obj

    # ------------------------------------------------------------------------
    # 5. GEOMETRY GENERATION
    # ------------------------------------------------------------------------
    print("Generating Model Geometry...")

    # --- A. SITE & HARDSCAPE ---
    add_box("Site_Ground_Terrain", (42.0, 36.0, 0.2), (1.0, 0.0, -0.1), mat_concrete_dark, col_site, emp_site)
    
    # Driveway Pavers Grid (Dark Granite Slabs with wet satin finish)
    for px in range(-6, 7):
        for py in range(-6, 0):
            p_width = 2.1
            p_length = 2.8
            p_gap = 0.06
            cx = px * (p_width + p_gap) + 1.5
            cy = py * (p_length + p_gap) - 4.5
            p_mat = mat_pavers if (px + py) % 2 == 0 else mat_pavers_light
            add_box(f"Landscape_Driveway_Tile_{px}_{py}", (p_width, p_length, 0.05), (cx, cy, 0.025), p_mat, col_driveway, emp_driveway)

    # Boundary Walls
    add_box("Site_Boundary_Left", (0.35, 26.0, 2.6), (-13.5, 0.0, 1.3), mat_concrete_dark, col_site, emp_site)
    add_box("Site_Boundary_Right", (0.35, 26.0, 2.6), (16.2, 0.0, 1.3), mat_concrete_dark, col_site, emp_site)
    add_box("Site_Boundary_Rear", (30.0, 0.35, 2.6), (1.35, 13.0, 1.3), mat_concrete_dark, col_site, emp_site)

    # Front Right Illuminated Architectural Signage Wall ("M&M CONSTRUCTIONS")
    add_box("Site_Signage_Wall_Pylon", (5.2, 0.7, 2.6), (13.8, -7.5, 1.3), mat_stone_ashlar, col_site, emp_site)
    add_box("Site_Signage_Plaque", (4.0, 0.1, 1.4), (13.8, -7.9, 1.4), mat_black_metal, col_site, emp_site)
    add_box("Site_Signage_Letters_MM", (3.0, 0.08, 0.8), (13.8, -8.0, 1.45), mat_signage_gold, col_site, emp_site)
    add_cylinder("Site_Signage_Spotlight_1", 0.12, 0.06, (12.2, -8.4, 0.1), material=mat_warm_light, collection=col_ext_lighting, parent_empty=emp_ext_lighting)
    add_cylinder("Site_Signage_Spotlight_2", 0.12, 0.06, (15.4, -8.4, 0.1), material=mat_warm_light, collection=col_ext_lighting, parent_empty=emp_ext_lighting)

    # --- B. FOUNDATION & STEPPED ENTRANCE PLINTH ---
    col_coords = [
        (-9.0, -2.0), (-9.0, 2.5), (-9.0, 7.0),
        (-2.5, -2.0), (-2.5, 2.5), (-2.5, 7.0),
        (3.0, -2.0),  (3.0, 2.5),  (3.0, 7.0),
        (10.0, -2.0), (10.0, 2.5), (10.0, 7.0)
    ]
    for idx, (cx, cy) in enumerate(col_coords):
        add_box(f"Foundation_Footing_Pad_{idx+1}", (1.5, 1.5, 0.6), (cx, cy, -0.4), mat_concrete, col_footings, emp_footings)
    
    add_box("Foundation_GradeBeam_X1", (20.5, 0.45, 0.5), (0.5, -2.0, -0.1), mat_concrete, col_ground_struct, emp_ground_struct)
    add_box("Foundation_GradeBeam_X2", (20.5, 0.45, 0.5), (0.5, 2.5, -0.1), mat_concrete, col_ground_struct, emp_ground_struct)
    add_box("Foundation_GradeBeam_X3", (20.5, 0.45, 0.5), (0.5, 7.0, -0.1), mat_concrete, col_ground_struct, emp_ground_struct)
    add_box("Foundation_Main_PlinthSlab", (20.5, 11.5, 0.45), (0.5, 2.5, 0.225), mat_concrete, col_found_slab, emp_found_slab)

    # 3-Tier Floating Stepped Entrance Plinth with Warm Under-Step LEDs
    add_box("Foundation_Step_Tier1", (9.2, 1.5, 0.16), (-5.6, -4.8, 0.08), mat_concrete, col_found_slab, emp_found_slab)
    add_box("Foundation_Step_Tier2", (8.6, 1.4, 0.16), (-5.6, -3.8, 0.24), mat_concrete, col_found_slab, emp_found_slab)
    add_box("Foundation_Step_Tier3", (8.0, 1.3, 0.16), (-5.6, -2.8, 0.40), mat_concrete, col_found_slab, emp_found_slab)
    add_box("Foundation_Step_LED_1", (9.0, 0.06, 0.04), (-5.6, -5.52, 0.04), mat_warm_light, col_ext_lighting, parent_empty=emp_ext_lighting)
    add_box("Foundation_Step_LED_2", (8.4, 0.06, 0.04), (-5.6, -4.48, 0.20), mat_warm_light, col_ext_lighting, parent_empty=emp_ext_lighting)
    add_box("Foundation_Step_LED_3", (7.8, 0.06, 0.04), (-5.6, -3.42, 0.36), mat_warm_light, col_ext_lighting, parent_empty=emp_ext_lighting)

    # --- C. PRIMARY STRUCTURAL FRAME ---
    for idx, (cx, cy) in enumerate(col_coords):
        add_box(f"Structure_Column_RCC_{idx+1}", (0.45, 0.45, 7.4), (cx, cy, 3.9), mat_concrete, col_columns, emp_columns)

    add_box("Structure_TransferBeam_Front", (20.5, 0.45, 0.5), (0.5, -2.0, 3.75), mat_concrete, col_beams, emp_beams)
    add_box("Structure_TransferBeam_Mid", (20.5, 0.45, 0.5), (0.5, 2.5, 3.75), mat_concrete, col_beams, emp_beams)
    add_box("Structure_TransferBeam_Rear", (20.5, 0.45, 0.5), (0.5, 7.0, 3.75), mat_concrete, col_beams, emp_beams)
    add_box("Structure_CrossBeam_Left", (0.45, 10.0, 0.5), (-9.0, 2.5, 3.75), mat_concrete, col_beams, emp_beams)
    add_box("Structure_CrossBeam_Center", (0.45, 10.0, 0.5), (-2.5, 2.5, 3.75), mat_concrete, col_beams, emp_beams)
    add_box("Structure_CrossBeam_Right", (0.45, 10.0, 0.5), (3.0, 2.5, 3.75), mat_concrete, col_beams, emp_beams)

    # Ground Floor Deck
    add_box("Structure_Ground_Floor_Deck", (20.0, 10.5, 0.25), (0.5, 2.5, 0.525), mat_concrete, col_struct_slabs, emp_struct_slabs)

    # First Floor Cantilevered Slab (Projecting out past the ground living room)
    add_box("Structure_FirstFloor_Cantilever_Slab", (14.2, 13.0, 0.45), (-2.8, 1.8, 3.8), mat_concrete, col_struct_slabs, emp_struct_slabs)
    # First Floor Upper Right Terrace Slab
    add_box("Structure_FirstFloor_Terrace_Slab", (8.8, 10.5, 0.38), (7.0, 2.5, 3.8), mat_concrete, col_struct_slabs, emp_struct_slabs)

    # Cantilevered Car Porch Canopy (Projecting dramatically over driveway)
    add_box("Structure_Carport_Cantilever_Canopy", (9.2, 9.0, 0.42), (7.8, -3.0, 3.55), mat_concrete, col_struct_slabs, emp_struct_slabs)
    # Recessed spotlights in Carport Canopy
    for sx in [4.8, 7.2, 9.6]:
        for sy in [-1.5, -4.0, -6.5]:
            add_cylinder(f"Carport_Downlight_{sx}_{sy}", 0.14, 0.04, (sx, sy, 3.32), material=mat_warm_light, collection=col_ext_lighting, parent_empty=emp_ext_lighting)

    # Luxury SUV / Sedan parked in Carport
    add_box("Interior_Car_Body", (2.1, 4.6, 1.35), (7.5, -3.5, 1.0), mat_car_body, col_furniture, emp_furniture)
    add_box("Interior_Car_Cabin", (1.85, 2.5, 0.75), (7.5, -3.3, 1.8), mat_black_metal, col_furniture, emp_furniture)
    add_box("Interior_Car_Wheel_FL", (0.3, 0.7, 0.7), (6.35, -5.0, 0.5), mat_black_metal, col_furniture, emp_furniture)
    add_box("Interior_Car_Wheel_FR", (0.3, 0.7, 0.7), (8.65, -5.0, 0.5), mat_black_metal, col_furniture, emp_furniture)
    add_box("Interior_Car_Wheel_RL", (0.3, 0.7, 0.7), (6.35, -2.0, 0.5), mat_black_metal, col_furniture, emp_furniture)
    add_box("Interior_Car_Wheel_RR", (0.3, 0.7, 0.7), (8.65, -2.0, 0.5), mat_black_metal, col_furniture, emp_furniture)

    # --- D. ARCHITECTURE, WALLS & STAIRCASE ---
    add_box("Architecture_Wall_Ground_Left", (0.4, 9.5, 3.2), (-9.2, 2.5, 2.1), mat_concrete_dark, col_walls, emp_walls)
    add_box("Architecture_Wall_Ground_Rear", (20.0, 0.35, 3.2), (0.5, 7.2, 2.1), mat_concrete, col_walls, emp_walls)
    add_box("Architecture_Partition_Kitchen", (0.25, 5.0, 3.2), (3.0, 4.5, 2.1), mat_concrete, col_partitions, emp_partitions)

    add_box("Architecture_Wall_Upper_Left", (0.4, 9.5, 3.3), (-9.2, 2.5, 5.7), mat_concrete_dark, col_upper_floor, emp_upper_floor)
    add_box("Architecture_Wall_Upper_Rear", (20.0, 0.35, 3.3), (0.5, 7.2, 5.7), mat_concrete, col_upper_floor, emp_upper_floor)
    add_box("Architecture_Wall_Upper_Divider", (0.25, 6.0, 3.3), (-2.5, 4.0, 5.7), mat_concrete, col_partitions, emp_partitions)

    # Floating Staircase inside Double-Height Glazed Atrium
    add_box("Architecture_Stair_Spine_Stringer", (0.25, 4.8, 0.35), (-1.2, 2.0, 2.1), mat_black_metal, col_staircase, emp_staircase)
    for s in range(16):
        t_ratio = s / 15.0
        tx = -2.1 + t_ratio * 1.9
        ty = -0.6 + t_ratio * 4.4
        tz = 0.65 + t_ratio * 3.1
        add_box(f"Architecture_Stair_Tread_{s+1}", (1.3, 0.34, 0.08), (tx, ty, tz), mat_teak, col_staircase, emp_staircase)
        add_box(f"Architecture_Stair_LED_{s+1}", (1.2, 0.04, 0.02), (tx, ty - 0.14, tz - 0.04), mat_warm_light, col_interior_lighting, parent_empty=emp_interior_lighting)

    add_box("Architecture_Stair_Glass_Rail", (0.04, 5.0, 1.05), (-1.3, 2.0, 2.75), mat_glass_balustrade, col_staircase, emp_staircase)

    # Master Balcony & Planter Box (Upper Floor Left)
    add_box("Architecture_Balcony_Front_Deck", (7.5, 2.4, 0.22), (-5.8, -3.4, 3.9), mat_concrete, col_balcony, emp_balcony)
    add_box("Architecture_Balcony_Planter_Box", (7.8, 0.55, 0.65), (-5.8, -4.5, 4.25), mat_concrete_dark, col_balcony, emp_balcony)

    # Left Wing Solid Cantilevered Roof Slab with Deep Overhang
    add_box("Architecture_Roof_Left_Slab", (15.2, 14.0, 0.48), (-3.2, 2.0, 7.55), mat_concrete, col_roof, emp_roof)
    # Recessed Spotlights under Roof Cantilever Overhang
    for rx in [-7.8, -5.2, -2.6, 0.0]:
        for ry in [-1.0, 2.5, 5.5]:
            add_cylinder(f"Roof_Downlight_{rx}_{ry}", 0.14, 0.04, (rx, ry, 7.28), material=mat_warm_light, collection=col_interior_lighting, parent_empty=emp_interior_lighting)

    # Upper Right Rooftop Terrace Pergola Structure (Black Steel Box with Horizontal Louver Blades & Open Skylight Frame)
    add_box("Architecture_Pergola_Beam_Front", (9.2, 0.35, 0.45), (7.0, -4.2, 7.65), mat_black_metal, col_roof, emp_roof)
    add_box("Architecture_Pergola_Beam_Rear", (9.2, 0.35, 0.45), (7.0, 4.8, 7.65), mat_black_metal, col_roof)
    add_box("Architecture_Pergola_Beam_Right", (0.35, 9.2, 0.45), (11.5, 0.3, 7.65), mat_black_metal, col_roof)
    add_box("Architecture_Pergola_Beam_Left", (0.35, 9.2, 0.45), (2.5, 0.3, 7.65), mat_black_metal, col_roof)
    for px in [3.5, 4.7, 5.9, 7.1, 8.3, 9.5, 10.7]:
        add_box(f"Architecture_Pergola_Blade_{px}", (0.12, 8.8, 0.38), (px, 0.3, 7.65), mat_black_metal, col_roof, emp_roof)

    # --- E. FACADE (Teak Louvers, Ashlar Sandstone Wall, Basalt Pylons) ---
    # Ground Floor Left Vertical Teak Fins
    for lx in range(14):
        pos_x = -9.0 + lx * 0.28
        add_box(f"Facade_Teak_Louver_Ground_{lx+1}", (0.07, 0.32, 3.15), (pos_x, -2.0, 2.2), mat_teak, col_woodfins, emp_woodfins)

    # Upper Floor Left Vertical Teak Fins
    for lx in range(16):
        pos_x = -9.0 + lx * 0.28
        add_box(f"Facade_Teak_Louver_Upper_{lx+1}", (0.07, 0.38, 3.3), (pos_x, -2.0, 5.75), mat_teak, col_woodfins, emp_woodfins)

    # Entrance Portal Teak Screening (Behind Carport)
    for lx in range(10):
        pos_x = 2.6 + lx * 0.28
        add_box(f"Facade_Teak_Louver_Carport_{lx+1}", (0.07, 0.32, 3.1), (pos_x, -2.0, 2.15), mat_teak, col_woodfins, emp_woodfins)

    # Dry-Stacked Sandstone Ashlar Feature Wall (Right Facade behind Carport)
    add_box("Facade_Stone_Ashlar_Wall", (5.8, 0.65, 3.35), (8.8, 1.5, 2.2), mat_stone_ashlar, col_stone_facade, emp_stone_facade)
    add_cylinder("Facade_Stone_Uplight_1", 0.16, 0.06, (6.8, 1.0, 0.65), material=mat_warm_light, collection=col_ext_lighting, parent_empty=emp_ext_lighting)
    add_cylinder("Facade_Stone_Uplight_2", 0.16, 0.06, (10.2, 1.0, 0.65), material=mat_warm_light, collection=col_ext_lighting, parent_empty=emp_ext_lighting)

    # Architectural Basalt Pylons / Vertical Concrete Framing
    add_box("Facade_Basalt_Pylon_Left", (1.25, 0.85, 7.5), (-9.3, -2.0, 4.0), mat_concrete_dark, col_concrete_facade, emp_concrete_facade)
    add_box("Facade_Basalt_Pylon_Center", (0.85, 0.85, 7.5), (-2.5, -2.0, 4.0), mat_concrete_dark, col_concrete_facade, emp_concrete_facade)
    add_box("Facade_Basalt_Pylon_Right", (1.05, 0.85, 7.5), (11.5, 1.0, 4.0), mat_concrete_dark, col_concrete_facade, emp_concrete_facade)

    # Earthen Terracotta Decorative Pots / Urns by the entrance
    add_cylinder("Landscape_Terracotta_Urn_1", 0.45, 1.2, (4.5, -2.6, 1.2), vertices=20, material=mat_terracotta, collection=col_plants, parent_empty=emp_plants)
    add_cylinder("Landscape_Terracotta_Urn_2", 0.38, 0.95, (5.4, -2.8, 1.05), vertices=20, material=mat_terracotta, collection=col_plants, parent_empty=emp_plants)

    # --- F. ENVELOPE (Glass Windows, Doors, Balustrades & Sheer Curtains) ---
    # Ground Floor Living Glazing
    add_box("Envelope_Glass_Living_Panel_1", (3.0, 0.06, 3.05), (-5.6, -2.05, 2.15), mat_glass, col_glass, emp_glass)
    add_box("Envelope_Glass_Living_Panel_2", (3.0, 0.06, 3.05), (-2.7, -2.0, 2.15), mat_glass, col_glass, emp_glass)
    add_box("Envelope_Frame_Living_Top", (6.2, 0.12, 0.08), (-4.1, -2.02, 3.7), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Living_Bottom", (6.2, 0.12, 0.08), (-4.1, -2.02, 0.62), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Living_Mullion_L", (0.08, 0.12, 3.05), (-7.1, -2.02, 2.15), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Living_Mullion_M", (0.08, 0.12, 3.05), (-4.1, -2.02, 2.15), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Living_Mullion_R", (0.08, 0.12, 3.05), (-1.2, -2.02, 2.15), mat_black_metal, col_frames, emp_frames)

    # Double-Height Glazed Atrium Window Wall
    add_box("Envelope_Glass_Atrium_Curtain", (5.2, 0.08, 6.6), (0.2, -2.05, 3.9), mat_glass, col_glass, emp_glass)
    add_box("Envelope_Frame_Atrium_Mullion_1", (0.09, 0.14, 6.7), (-2.2, -2.02, 3.9), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Atrium_Mullion_2", (0.09, 0.14, 6.7), (0.2, -2.02, 3.9), mat_black_metal, col_frames, emp_frames)
    add_box("Envelope_Frame_Atrium_Mullion_3", (0.09, 0.14, 6.7), (2.6, -2.02, 3.9), mat_black_metal, col_frames, emp_frames)

    # Upper Floor Master Glazing
    add_box("Envelope_Glass_Master_Panel_1", (3.0, 0.06, 3.1), (-5.6, -2.05, 5.65), mat_glass, col_glass, emp_glass)
    add_box("Envelope_Glass_Master_Panel_2", (3.0, 0.06, 3.1), (-2.7, -2.0, 5.65), mat_glass, col_glass, emp_glass)

    # Glass Balustrades
    add_box("Envelope_Balustrade_Left_Balcony", (7.6, 0.04, 1.05), (-5.8, -4.7, 4.6), mat_glass_balustrade, col_glass, emp_glass)
    add_box("Envelope_Balustrade_Right_Terrace_Front", (8.6, 0.04, 1.05), (7.0, -4.3, 4.6), mat_glass_balustrade, col_glass, emp_glass)
    add_box("Envelope_Balustrade_Right_Terrace_Side", (0.04, 8.8, 1.05), (11.3, 0.3, 4.6), mat_glass_balustrade, col_glass, emp_glass)

    # Sheer White Curtains
    add_box("Envelope_Sheer_Curtain_Atrium", (1.4, 0.18, 6.5), (-1.7, -1.8, 3.9), mat_sheer, col_interior, emp_interior)
    add_box("Envelope_Sheer_Curtain_Living", (0.9, 0.18, 3.0), (-6.9, -1.8, 2.15), mat_sheer, col_interior, emp_interior)

    # --- G. INTERIOR & FURNITURE ---
    add_box("Interior_Living_Sofa_Main", (3.4, 1.15, 0.75), (-5.4, 0.6, 1.0), mat_fabric, col_livingroom, emp_livingroom)
    add_box("Interior_Living_Sofa_Return", (1.15, 2.3, 0.75), (-7.1, 1.7, 1.0), mat_fabric, col_livingroom, emp_livingroom)
    add_box("Interior_Living_CoffeeTable", (1.5, 0.85, 0.38), (-5.2, 1.6, 0.8), mat_teak_dark, col_livingroom, emp_livingroom)
    add_box("Interior_Living_Rug", (4.2, 3.4, 0.02), (-5.4, 1.3, 0.6), mat_fabric, col_livingroom, emp_livingroom)

    add_box("Interior_Dining_Table", (2.6, 1.25, 0.78), (0.5, 4.2, 1.0), mat_teak, col_kitchen, emp_kitchen)
    for chair_x in [-0.6, 0.5, 1.6]:
        add_box(f"Interior_Dining_Chair_F_{chair_x}", (0.46, 0.46, 0.88), (chair_x, 3.3, 1.02), mat_fabric, col_kitchen, emp_kitchen)
        add_box(f"Interior_Dining_Chair_R_{chair_x}", (0.46, 0.46, 0.88), (chair_x, 5.1, 1.02), mat_fabric, col_kitchen, emp_kitchen)

    add_box("Interior_Kitchen_Island", (3.6, 1.25, 0.92), (6.5, 4.6, 1.1), mat_concrete_dark, col_kitchen, emp_kitchen)

    add_box("Interior_Master_Bed_Frame", (2.5, 2.3, 0.48), (-5.4, 1.6, 4.3), mat_teak_dark, col_bedroom, emp_bedroom)
    add_box("Interior_Master_Mattress", (2.1, 2.1, 0.38), (-5.4, 1.6, 4.65), mat_fabric, col_bedroom, emp_bedroom)
    add_box("Interior_Master_Headboard_Fluted", (3.4, 0.16, 1.7), (-5.4, 2.7, 5.1), mat_teak, col_bedroom, emp_bedroom)

    # Modern Branching Gold Chandelier in Double-Height Atrium
    add_cylinder("Interior_Chandelier_Stem", 0.025, 2.6, (0.2, 0.5, 5.8), material=mat_black_metal, collection=col_interior_lighting, parent_empty=emp_interior_lighting)
    for ca in range(8):
        angle = (ca / 8.0) * math.pi * 2
        bx = 0.2 + math.cos(angle) * 0.85
        by = 0.5 + math.sin(angle) * 0.85
        bz = 4.7 + (ca % 4) * 0.35
        add_cylinder(f"Interior_Chandelier_Arm_{ca+1}", 0.016, 0.9, (bx, by, bz), rotation=(0.4 * math.sin(angle), 0.4 * math.cos(angle), 0), material=mat_black_metal, collection=col_interior_lighting, parent_empty=emp_interior_lighting)
        add_cylinder(f"Interior_Chandelier_Bulb_{ca+1}", 0.07, 0.09, (bx * 1.05, by * 1.05, bz - 0.1), material=mat_warm_light, collection=col_interior_lighting, parent_empty=emp_interior_lighting)

    # Ceiling Recessed Warm Cove Lighting
    add_box("Interior_CoveLight_Living_Front", (6.8, 0.08, 0.04), (-5.4, -1.8, 3.65), mat_warm_light, col_interior_lighting, parent_empty=emp_interior_lighting)
    add_box("Interior_CoveLight_Living_Rear", (6.8, 0.08, 0.04), (-5.4, 6.0, 3.65), mat_warm_light, col_interior_lighting, parent_empty=emp_interior_lighting)
    add_box("Interior_CoveLight_Master_Front", (6.8, 0.08, 0.04), (-5.4, -1.8, 7.35), mat_warm_light, col_interior_lighting, parent_empty=emp_interior_lighting)
    add_box("Interior_CoveLight_Master_Rear", (6.8, 0.08, 0.04), (-5.4, 6.0, 7.35), mat_warm_light, col_interior_lighting, parent_empty=emp_interior_lighting)

    # --- H. REFINED TROPICAL VEGETATION (KERALA PALMS, PLUMERIA, PLANTERS) ---
    # 1. Center Planter Island in Driveway (Plumeria / Frangipani Tree)
    add_box("Landscape_Center_Planter_Curb", (3.4, 2.4, 0.32), (0.6, -7.2, 0.16), mat_concrete_dark, col_garden, emp_garden)
    
    # Plumeria Tree with Multi-Branching Woody Trunk
    add_cylinder("Landscape_Tree_Center_Base", 0.15, 1.4, (0.6, -7.2, 0.8), material=mat_bark, collection=col_trees, parent_empty=emp_trees)
    # 3 Main Branches
    branch_configs = [
        ((-0.3, 0.2, 0.8), (0.35, -0.4, 0.2), 1.2, 0.09),
        ((0.35, -0.2, 0.9), (-0.3, 0.35, -0.2), 1.3, 0.09),
        ((0.1, 0.35, 1.0), (0.2, 0.2, 0.6), 1.1, 0.08),
    ]
    for bidx, (b_off, b_rot, b_len, b_rad) in enumerate(branch_configs):
        bx = 0.6 + b_off[0]
        by = -7.2 + b_off[1]
        bz = 1.4 + b_off[2]
        add_cylinder(f"Landscape_Tree_Branch_{bidx+1}", b_rad, b_len, (bx, by, bz), rotation=b_rot, material=mat_bark, collection=col_trees, parent_empty=emp_trees)

    # Lush Leaf Rosettes on Center Tree
    leaf_clusters = [
        (0.2, -7.0, 2.5, 0.85, mat_foliage_lush),
        (0.6, -7.2, 2.7, 0.95, mat_foliage_bright),
        (1.1, -7.4, 2.4, 0.80, mat_foliage_lush),
        (0.7, -6.8, 2.6, 0.75, mat_foliage_bright),
        (0.3, -7.5, 2.3, 0.70, mat_foliage_lush),
    ]
    for fx, fy, fz, fr, fmat in leaf_clusters:
        add_sphere(f"Landscape_Tree_Canopy_{fx}_{fy}", fr, scale=(1.2, 1.2, 0.7), location=(fx, fy, fz), material=fmat, collection=col_trees, parent_empty=emp_trees)

    # Groundcover Shrubs in Center Planter
    for px in [-0.3, 0.3, 0.9, 1.3]:
        for py in [-6.5, -7.2, -7.9]:
            s_mat = mat_foliage_bright if (px + py) > -6.5 else mat_foliage_lush
            add_sphere(f"Landscape_Shrub_{px}_{py}", 0.26, scale=(1.1, 1.1, 0.6), location=(px, py, 0.40), material=s_mat, collection=col_plants, parent_empty=emp_plants)

    # 2. Upper Rooftop Terrace Specimen Tree (Emerging through pergola skylight)
    add_cylinder("Landscape_Terrace_Tree_Trunk", 0.14, 2.8, (7.0, 0.2, 5.0), material=mat_bark, collection=col_trees, parent_empty=emp_trees)
    add_cylinder("Landscape_Terrace_Tree_Branch1", 0.08, 1.5, (6.6, -0.2, 6.2), rotation=(0.3, -0.3, 0.5), material=mat_bark, collection=col_trees, parent_empty=emp_trees)
    add_cylinder("Landscape_Terrace_Tree_Branch2", 0.08, 1.6, (7.4, 0.5, 6.3), rotation=(-0.25, 0.35, -0.4), material=mat_bark, collection=col_trees, parent_empty=emp_trees)
    for tx, ty, tz, tr, tmat in [
        (7.0, 0.2, 7.0, 1.25, mat_foliage_bright),
        (6.1, -0.4, 6.6, 0.95, mat_foliage_lush),
        (7.9, 0.7, 7.1, 1.0, mat_foliage_lush),
        (7.3, 1.1, 7.6, 0.85, mat_foliage_bright),
    ]:
        add_sphere(f"Landscape_Terrace_Canopy_{tx}_{ty}", tr, scale=(1.15, 1.15, 0.75), location=(tx, ty, tz), material=tmat, collection=col_trees, parent_empty=emp_trees)

    # 3. Master Balcony Planter Lush Tropical Greenery (Monstera / Broad Leaves)
    for bx in range(10):
        pos_x = -8.8 + bx * 0.72
        bmat = mat_foliage_bright if bx % 2 == 0 else mat_foliage_lush
        add_sphere(f"Landscape_Balcony_Plant_{bx+1}", 0.38, scale=(1.2, 0.75, 0.65), location=(pos_x, -4.4, 4.4), material=bmat, collection=col_plants, parent_empty=emp_plants)

    # 4. Kerala Coconut Palms (Framing left & right boundaries with slender curved trunks & radial fronds)
    palm_locations = [
        (-14.0, -6.5, 10.5), (-14.5, 2.0, 11.0), (-13.0, 8.5, 9.8),
        (16.5, -5.0, 11.2), (17.0, 3.5, 10.8), (15.5, 9.0, 9.5)
    ]
    for pidx, (plx, ply, pheight) in enumerate(palm_locations):
        # Trunk segments with slight natural curve
        add_cylinder(f"Landscape_Palm_Trunk_{pidx+1}", 0.16, pheight, (plx, ply, pheight * 0.5), rotation=(0.04, -0.05, 0.1 * pidx), material=mat_bark, collection=col_trees, parent_empty=emp_trees)
        # Crown fronds radiating outward and drooping
        for frond_idx in range(8):
            f_angle = (frond_idx / 8.0) * math.pi * 2
            fx = plx + math.cos(f_angle) * 1.8
            fy = ply + math.sin(f_angle) * 1.8
            fz = pheight - 0.2 + math.sin(f_angle * 2) * 0.3
            add_sphere(f"Landscape_Palm_Frond_{pidx+1}_{frond_idx+1}", 0.60, scale=(1.8, 0.40, 0.18), location=(fx, fy, fz), rotation=(0.15 * math.sin(f_angle), 0.35, f_angle), material=mat_foliage_lush, collection=col_trees, parent_empty=emp_trees)

    # 5. Minimalist Square Exterior Bollard Lights with Warm Glowing Lenses
    bollard_coords = [
        (-11.0, -9.0), (-1.8, -9.5), (2.8, -9.5), (11.8, -9.5),
        (-13.0, -4.5), (14.0, -5.0), (-9.0, -11.5), (9.0, -11.5),
        (-0.8, -6.2), (2.0, -6.2)
    ]
    for bidx, (bx, by) in enumerate(bollard_coords):
        add_box(f"Landscape_Bollard_Post_{bidx+1}", (0.16, 0.16, 0.70), (bx, by, 0.35), mat_black_metal, col_ext_lighting, emp_ext_lighting)
        add_box(f"Landscape_Bollard_Lamp_{bidx+1}", (0.14, 0.14, 0.12), (bx, by, 0.64), mat_warm_light, col_ext_lighting, emp_ext_lighting)

    # --- I. HERO CAMERA & CINEMATIC DUSK LIGHTING ---
    cam_data = bpy.data.cameras.new(name="Hero_Architectural_Camera")
    cam_data.lens = 28 # Wide 28mm architectural lens matching master reference
    cam_data.clip_start = 0.1
    cam_data.clip_end = 400.0
    cam_obj = bpy.data.objects.new(name="Hero_Camera", object_data=cam_data)
    
    # Front-left wide establishing perspective matching master reference
    cam_obj.location = (-11.5, -21.5, 3.2)
    target = Vector((0.5, -0.5, 3.6))
    direction = target - cam_obj.location
    rot_quat = direction.to_track_quat('-Z', 'Y')
    cam_obj.rotation_euler = rot_quat.to_euler()
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Key Golden-Amber Sunlight (Warm low-angle sun casting long dramatic shadows)
    sun_data = bpy.data.lights.new(name="Key_Sun_Dusk", type='SUN')
    sun_data.energy = 6.5
    sun_data.color = (1.0, 0.82, 0.65)
    sun_obj = bpy.data.objects.new(name="Key_Sun", object_data=sun_data)
    sun_obj.rotation_euler = (math.radians(45), math.radians(15), math.radians(-42))
    bpy.context.scene.collection.objects.link(sun_obj)

    # Twilight Sky Fill (Deep indigo/sapphire twilight ambiance)
    sky_data = bpy.data.lights.new(name="Sky_Twilight_Fill", type='SUN')
    sky_data.energy = 2.8
    sky_data.color = (0.42, 0.58, 0.85)
    sky_obj = bpy.data.objects.new(name="Sky_Fill", object_data=sky_data)
    sky_obj.rotation_euler = (math.radians(65), math.radians(-18), math.radians(138))
    bpy.context.scene.collection.objects.link(sky_obj)

    # Point Lights for Rich Interior & Facade Glow
    interior_lights = [
        ("Light_Living_Warm", (-5.4, 1.0, 2.6), 80.0, (1.0, 0.80, 0.50)),
        ("Light_Atrium_Chandelier", (0.2, 0.5, 4.8), 120.0, (1.0, 0.85, 0.55)),
        ("Light_Master_Suite", (-5.4, 1.5, 5.8), 80.0, (1.0, 0.80, 0.50)),
        ("Light_Carport_Ceiling", (7.5, -3.2, 3.1), 90.0, (1.0, 0.82, 0.52)),
        ("Light_Sandstone_Wash", (8.5, 0.8, 1.5), 70.0, (1.0, 0.82, 0.50)),
        ("Light_Entry_Steps", (-5.6, -4.5, 0.6), 50.0, (1.0, 0.85, 0.55)),
    ]
    for lname, lpos, lpwr, lcol in interior_lights:
        p_data = bpy.data.lights.new(name=lname, type='POINT')
        p_data.energy = lpwr
        p_data.color = lcol
        p_data.shadow_soft_size = 0.4
        p_obj = bpy.data.objects.new(lname, object_data=p_data)
        p_obj.location = lpos
        bpy.context.scene.collection.objects.link(p_obj)

    # World Twilight Sky Background
    world = scene.world
    if not world:
        world = bpy.data.worlds.new("World")
        scene.world = world
    world.use_nodes = True
    bg_node = world.node_tree.nodes.get('Background')
    if bg_node:
        bg_node.inputs['Color'].default_value = (0.07, 0.11, 0.22, 1.0)
        bg_node.inputs['Strength'].default_value = 1.6

    print("Architecture build complete!")

if __name__ == "__main__":
    build_accurate_signature_house()
    
    # Save Blend file
    blend_path = "MM_Signature_House.blend"
    bpy.ops.wm.save_mainfile(filepath=blend_path)
    print(f"Saved {blend_path} successfully!")

    # Export to GLB
    export_path = "react-app/public/models/mm-signature-house.glb"
    bpy.ops.export_scene.gltf(
        filepath=export_path,
        export_format='GLB',
        use_selection=False,
        export_apply=True,
        export_materials='EXPORT',
        export_cameras=False,
        export_lights=False,
        export_yup=True
    )
    print(f"Exported {export_path} successfully!")

    # Render Hero Camera View
    scene = bpy.context.scene
    scene.render.resolution_x = 1920
    scene.render.resolution_y = 1080
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = 'PNG'
    render_out = os.path.abspath("render_hero.png")
    scene.render.filepath = render_out

    # Configure render engine (Cycles for photorealistic architectural lighting)
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 128
    scene.cycles.device = 'CPU'

    print(f"Rendering hero view with Cycles to {render_out}...")
    bpy.ops.render.render(write_still=True)
    print("Render completed!")
