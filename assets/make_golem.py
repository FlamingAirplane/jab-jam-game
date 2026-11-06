import bpy
import os
import math

# Remove default cube/light/camera.
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# Shared grey stone material with a little roughness.
mat = bpy.data.materials.new(name='golem_grey')
mat.use_nodes = True
bsdf = mat.node_tree.nodes['Principled BSDF']
bsdf.inputs['Base Color'].default_value = (0.55, 0.56, 0.58, 1.0)
bsdf.inputs['Roughness'].default_value = 0.85

def add_box(name, size, location, rotation=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location, rotation=rotation)
    obj = bpy.context.active_object
    obj.name = name
    obj.scale = size
    obj.data.materials.append(mat)
    return obj

# Reference direction: the golem faces +Y in Blender; three.js will rotate to +Z.
# Legs
add_box('legL',  (0.42, 0.55, 1.1), (-0.32, 0.0, 0.0), (0.05, 0, 0.05))
add_box('legR',  (0.42, 0.55, 1.1), (0.32, 0.0, 0.0), (-0.05, 0, -0.05))
# Feet
add_box('footL', (0.5, 0.75, 0.35), (-0.32, 0.25, -0.45), (0.1, 0, 0))
add_box('footR', (0.5, 0.75, 0.35), (0.32, 0.25, -0.45), (-0.1, 0, 0))

# Hips / waist
add_box('hips', (0.85, 0.55, 0.45), (0.0, 0.0, 0.2))

# Torso: layered chest plates
add_box('chest',  (0.95, 0.75, 0.65), (0.0, 0.85, 0.0), (0.08, 0, 0))
add_box('abs',    (0.75, 0.55, 0.55), (0.0, 0.45, 0.05), (0.04, 0, 0))

# Head
add_box('head', (0.45, 0.55, 0.45), (0.0, 1.55, 0.05), (0.05, 0, 0))

# Shoulders (large angular plates)
add_box('shoulderL', (0.55, 0.85, 0.55), (-0.72, 1.15, 0.0), (0.0, 0, 0.25))
add_box('shoulderR', (0.55, 0.85, 0.55), (0.72, 1.15, 0.0), (0.0, 0, -0.25))

# Arms
add_box('armL', (0.32, 0.85, 0.35), (-0.78, 0.55, 0.0), (0.15, 0, 0.15))
add_box('armR', (0.32, 0.85, 0.35), (0.78, 0.55, 0.0), (-0.15, 0, -0.15))

# Gauntlets
add_box('gauntletL', (0.4, 0.55, 0.45), (-0.78, 0.05, 0.05), (0.1, 0, 0.1))
add_box('gauntletR', (0.4, 0.55, 0.45), (0.78, 0.05, 0.05), (-0.1, 0, -0.1))

# Spikes / crystal shards on shoulders and knees
add_box('spikeL', (0.18, 0.55, 0.18), (-0.95, 1.25, 0.0), (0.0, 0, 0.6))
add_box('spikeR', (0.18, 0.55, 0.18), (0.95, 1.25, 0.0), (0.0, 0, -0.6))
add_box('kneeSpikeL', (0.12, 0.35, 0.12), (-0.35, 0.35, 0.45), (0.5, 0, 0.2))
add_box('kneeSpikeR', (0.12, 0.35, 0.12), (0.35, 0.35, 0.45), (-0.5, 0, -0.2))

out_path = os.path.join(os.getcwd(), 'assets', 'golem.glb')
bpy.ops.export_scene.gltf(filepath=out_path, export_format='GLB')
print('Exported golem to', out_path)
