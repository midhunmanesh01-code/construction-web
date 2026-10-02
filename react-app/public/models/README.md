# M&M Signature House Model

Place the architectural GLB model here:

```
mm-signature-house.glb
```

## Required Named Group Hierarchy

The model must contain named objects following this structure.
The animation system discovers groups by name and animates them independently.

```
House (root)
├── Site
├── Foundation
│   ├── Footings
│   ├── FoundationSlab
│   └── GroundStructure
├── Structure
│   ├── Columns
│   ├── Beams
│   └── Slabs
├── Architecture
│   ├── Walls
│   ├── Partitions
│   ├── Floors
│   ├── Stairs
│   ├── Balcony
│   └── Roof
├── Envelope
│   ├── Windows
│   ├── Glass
│   ├── Doors
│   └── Frames
├── Facade
│   ├── Concrete
│   ├── Stone
│   ├── WoodFins
│   └── Screens
├── Interior
│   ├── Furniture
│   ├── Kitchen
│   ├── LivingRoom
│   ├── Bedroom
│   └── Lighting
└── Landscape
    ├── Trees
    ├── Plants
    ├── Garden
    ├── Driveway
    └── ExteriorLighting
```

## Design Reference

- Contemporary luxury, 2-storey
- Cantilevered concrete slabs
- Vertical warm wood fins
- Floor-to-ceiling glass
- Natural stone cladding
- Double-height living area
- Tropical landscaping (palms)
- Kerala / Indian modern character

## Technical

- Export as GLB (binary glTF)
- Draco compression supported
- Target: 50k–150k triangles
- Textures: 2K max, JPEG in GLB
- PBR materials (roughness/metalness)
