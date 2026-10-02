import bpy

print("=" * 60)
print("INSPECTING MM_Signature_House.blend")
print("=" * 60)

print(f"Blender Version: {bpy.app.version_string}")

print("\n--- COLLECTIONS ---")
for col in bpy.data.collections:
    print(f"Collection: {col.name} (objects: {len(col.objects)})")
    for obj in col.objects:
        print(f"  - {obj.name} (type: {obj.type}, loc: {obj.location}, dim: {obj.dimensions})")

print("\n--- ALL OBJECTS ---")
for obj in bpy.data.objects:
    print(f"Object: {obj.name} | Type: {obj.type} | Parent: {obj.parent.name if obj.parent else 'None'}")
    if obj.type == 'MESH' and obj.data:
        print(f"   Verts: {len(obj.data.vertices)}, Faces: {len(obj.data.polygons)}, Materials: {[m.name for m in obj.data.materials if m]}")

print("\n--- MATERIALS ---")
for mat in bpy.data.materials:
    print(f"Material: {mat.name} (use_nodes: {mat.use_nodes})")

print("=" * 60)
