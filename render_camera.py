import bpy
import os

scene = bpy.context.scene

print(f"Active Camera: {scene.camera.name if scene.camera else 'None'}")
print(f"Render Engine: {scene.render.engine}")

scene.render.resolution_x = 1920
scene.render.resolution_y = 1080
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'

# Absolute output path in the project directory
output_path = os.path.abspath("render_hero.png")
scene.render.filepath = output_path
print(f"Render output path: {output_path}")

# Setup EEVEE settings
if hasattr(bpy.types, 'RenderEngine') and 'BLENDER_EEVEE_NEXT' in [e.identifier for e in bpy.types.RenderEngine.__subclasses__() if hasattr(e, 'identifier')]:
    scene.render.engine = 'BLENDER_EEVEE_NEXT'
else:
    scene.render.engine = 'BLENDER_EEVEE'

# Set world background color to twilight dusk
world = scene.world
if not world:
    world = bpy.data.worlds.new("World")
    scene.world = world

world.use_nodes = True
bg_node = world.node_tree.nodes.get('Background')
if bg_node:
    bg_node.inputs['Color'].default_value = (0.04, 0.06, 0.12, 1.0)
    bg_node.inputs['Strength'].default_value = 0.9

print("Starting render...")
bpy.ops.render.render(write_still=True)
print(f"Render completed successfully: {output_path}")
