import json
import struct
import os

glb_path = "react-app/public/models/mm-signature-house.glb"
print("=" * 60)
print(f"VERIFYING GLB: {glb_path}")
print("=" * 60)

if not os.path.exists(glb_path):
    print(f"ERROR: {glb_path} does not exist!")
    exit(1)

file_size = os.path.getsize(glb_path)
print(f"File Size: {file_size:,} bytes ({file_size / (1024*1024):.2f} MB)")

with open(glb_path, 'rb') as f:
    magic = f.read(4)
    if magic != b'glTF':
        print("Invalid magic number!")
        exit(1)
    version, length = struct.unpack('<II', f.read(8))
    print(f"glTF Version: {version}, Header Length: {length}")
    
    # Read chunk 0 (JSON)
    chunk_len, chunk_type = struct.unpack('<II', f.read(8))
    if chunk_type != 0x4E4F534A: # 'JSON'
        print("First chunk is not JSON!")
        exit(1)
    
    json_bytes = f.read(chunk_len)
    gltf = json.loads(json_bytes.decode('utf-8'))

print("\n--- SCENE GRAPH / NODES ---")
nodes = gltf.get('nodes', [])
print(f"Total Nodes: {len(nodes)}")

root_nodes = gltf.get('scenes', [{}])[0].get('nodes', [])
print(f"Root Node Indices: {root_nodes}")

# Collect node names
node_names = [n.get('name', f'Node_{i}') for i, n in enumerate(nodes)]

# Group categories
categories = {
    'Site': [],
    'Foundation': [],
    'Structure': [],
    'Architecture': [],
    'Envelope': [],
    'Facade': [],
    'Interior': [],
    'Landscape': [],
}

for name in node_names:
    for cat in categories:
        if name.startswith(cat) or name.startswith(f"{cat}_") or (cat in name):
            categories[cat].append(name)
            break

for cat, items in categories.items():
    print(f"\n[{cat}] ({len(items)} objects):")
    for item in items[:8]:
        print(f"  - {item}")
    if len(items) > 8:
        print(f"  ... and {len(items) - 8} more")

print("\n--- MATERIALS ---")
materials = gltf.get('materials', [])
print(f"Total Materials: {len(materials)}")
for m in materials:
    print(f"  - {m.get('name')}")

print("\n--- MESHES & PRIMITIVES ---")
meshes = gltf.get('meshes', [])
print(f"Total Meshes: {len(meshes)}")

print("=" * 60)
print("GLB VERIFICATION COMPLETE")
print("=" * 60)
