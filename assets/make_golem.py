import bpy
import os

# Remove default cube/light/camera.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Shared grey material.
mat = bpy.data.materials.new(name='golem_grey')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.78, 0.79, 0.80, 1.0)
bsdf.inputs['Roughness'].default_value = 0.8

def add_box(name, size, location):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    return obj

# Chunky golem built from boxes; +Y is forward in Blender, we'll face +Z in three.js.
add_box('torso',  (0.9, 1.1, 0.7), (0.0, 0.75, 0.0))
add_box('head',   (0.55, 0.5, 0.55), (0.0, 1.55, 0.0))
add_box('shoulderL', (0.35, 0.6, 0.45), (-0.62, 1.1, 0.0))
add_box('shoulderR', (0.35, 0.6, 0.45), (0.62, 1.1, 0.0))

out_path = os.path.join(os.getcwd(), 'assets', 'golem.glb')
bpy.ops.export_scene.gltf(filepath=out_path, export_format='GLB')
print('Exported golem to', out_path)
