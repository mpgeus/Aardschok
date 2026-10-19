# De stijlspecificatie (Marcel, 19 okt 2026)

Marcel gaf deze specificatie op 19 okt 2026, letterlijk hieronder ("Kun je hier wat mee?"). Ze is de maatstaf voor de
eigen pijplijn (`ontwerp/beeld.md`, "Onze eigen art, met onze eigen pijplijn"; `gereedschap/ai/ai-afwerking.md`). Hoe elk
deel in de pijplijn landt, staat in `gereedschap/ai/ai-afwerking.md`, "De stijlspecificatie in de pijplijn".

---

AARDSCHOK — MASTER ART STYLE SPECIFICATION V1.0

Artistic Direction

Create premium-quality, high-definition isometric 2D game artwork in a richly detailed, hand-painted pixel-art aesthetic.

The visual style combines the readability and intentional pixel placement of classic strategy game sprites with the sophisticated material rendering, depth, and finish of modern hand-painted fantasy illustrations.

The artwork must look meticulously crafted by an experienced game artist, not like a photograph converted into pixel art or a generic AI-generated fantasy illustration.

Core identity: Stylized realism, rich tactile materials, painterly pixel clusters, carefully controlled lighting, crisp silhouettes, and exceptionally polished surface details.

1. Geometry and Proportions

- Three-quarter isometric-style perspective, consistent across all assets.
- Solid, believable construction with clearly defined structural components.
- Slightly exaggerated proportions to improve readability at gameplay scale.
- Rounded, organic transitions on natural forms.
- Straight, mechanically consistent geometry on manufactured objects.
- Strong silhouettes and clearly separated overlapping components.
- Consistent perspective, object dimensions, and relative scale.

2. Rendering Technique

- High-resolution hand-painted pixel-art appearance.
- Carefully shaped pixel clusters rather than random pixel noise.
- Smooth tonal transitions within large surfaces, interrupted by precise, sharply defined texture details.
- Selective dark outlines emphasizing silhouettes, structural boundaries, and overlapping components.
- Interior outlines should be thinner and softer than exterior contours.
- Fine highlights concentrated along exposed edges, curved surfaces, and raised details.
- Strong ambient occlusion in joints, crevices, contact points, and overlapping geometry.
- Preserve clearly readable shapes even when the asset is reduced in size.
- No photographic textures, procedural noise overlays, or excessive sharpening.

3. Lighting and Shading

A consistent warm directional key light illuminates the object from the upper-left and slightly toward the viewer.

- Warm cream and golden highlights on illuminated surfaces.
- Cooler, muted brown, grey, and blue-grey tones in shadowed regions.
- Broad, softly graduated shading describes three-dimensional volume.
- Small, precise highlights emphasize individual material properties.
- Deep, localized contact shadows establish depth and physical connection.
- Avoid uniformly bright surfaces or completely black shadows.
- Lighting must remain consistent across every object and material.

4. Material Rendering

Natural Wood

Rich honey-brown, amber, and warm walnut tones.

Visible directional wood grain following the geometry of each plank, beam, spoke, or barrel stave.

Subtle fiber variation, occasional small cracks, irregular growth patterns, and naturally worn edges.

Dark seams between individual wooden components.

Small warm highlights along exposed edges and curved surfaces.

Wood should appear solid, tactile, and hand-crafted, never flat, plastic, or covered in repetitive photographic texture.

Forged Iron and Steel

Dark charcoal and desaturated blue-grey metal.

Slightly uneven forged surfaces with restrained hammer marks and subtle tonal irregularities.

Sharp, narrow highlights along exposed metallic edges.

Small individually shaded rivets, bolts, and reinforcement plates.

Strong contact shadows around joints and fasteners.

Metal must read as dense, heavy, and durable, with restrained reflectivity rather than polished chrome.

Leather

Warm chestnut and reddish-brown leather.

Smooth, gently curved surfaces with subtle specular highlights.

Darker seams, stitching, folds, and reinforced edges.

Minor wear concentrated around buckles, straps, and tension points.

The leather must feel thick, flexible, and functional.

Animal Fur

Soft, layered, directional fur rendered through small hand-painted strokes and controlled clusters.

Warm ivory and cream highlights transitioning into muted beige and grey-brown shadows.

Fine hair details follow the animal's anatomy and natural growth direction.

Large underlying shading forms must clearly describe musculature and body volume.

Avoid excessive individual hairs, photographic fur, and noisy texture.

Cloth and Burlap

Woven, matte textile surfaces with subtle directional fiber patterns.

Soft irregular folds and creases.

Warm, earthy color palettes with natural variation.

Strong shadows inside folds and restrained highlights along raised fabric ridges.

Cloth must look flexible and naturally weighted.

Gold and Brass

Warm saturated golden-yellow highlights, amber midtones, and rich orange-brown shadows.

Small, precisely positioned specular highlights.

Rounded metallic surfaces with clearly defined volume.

High visual contrast without excessive bloom or artificial glow.

5. Color Palette

Use a rich, warm, slightly saturated medieval fantasy palette.

Natural materials retain distinct color identities.

Highlights are warm and luminous, while shadows are slightly cooler and more subdued.

Maintain strong separation between neighboring materials through hue, brightness, texture, and edge treatment.

Avoid washed-out colors, muddy shading, excessive saturation, and uniform material coloring.

6. Texture Hierarchy

Every asset must contain three levels of detail:

Primary: Large readable forms, silhouettes, and volume-defining shadows.

Secondary: Structural features, plank boundaries, joints, folds, muscle groups, and construction details.

Tertiary: Fine wood grain, rivets, hair clusters, stitching, scratches, and small surface highlights.

Primary forms must remain visually dominant.

Secondary details provide material and construction credibility.

Tertiary details provide richness without overwhelming the image.

Texture density must depend on the material and object size.

7. Finishing Quality

The final artwork must feel like a polished, production-ready sprite for a premium medieval strategy game.

Every visible detail must support the object's form, material, or function.

Avoid generic texture overlays, excessive outlines, blurry edges, inconsistent lighting, disproportionate details, and decorative noise.

Maintain the same visual language, material treatment, shading style, and texture density across all assets.

The goal is not maximum detail everywhere. The goal is maximum material credibility, depth, and readability through carefully controlled detail.

8. Technical Requirements

- Consistent three-quarter isometric-style camera orientation.
- Orthographic projection unless the reference geometry explicitly requires otherwise.
- Consistent world scale and pixels-per-world-unit.
- Identical lighting direction and shadow conventions across assets.
- Consistent rendering resolution and downsampling method.
- Transparent background for production sprites.
- No ground plane or cast ground shadow unless requested separately.
- No text, labels, interface elements, or unrelated decorative objects.

Negative Style Constraints

No photorealism, no flat vector art, no low-detail cartoon shading, no generic 3D-render appearance, no smooth plastic surfaces, no random pixel noise, no automatic pixelation filters, no blurry texture overlays, no inconsistent perspective, no excessive microdetail, no watercolor bleeding, no thick uniform black outlines, no excessive bloom, no metallic chrome reflections, no procedural texture repetition.

When implementing this art style, do not treat the specification as a collection of decorative textures or color filters.

The renderer must reproduce the underlying artistic principles.

Material textures must follow object geometry, surface orientation, and construction logic.

Shading must describe three-dimensional volume before fine surface details are applied.

Highlights, grain patterns, wear, and microdetails must be positioned according to material properties, lighting direction, and local geometry.

Prioritize structural readability and intentional artistic placement over procedural detail density.

Use the supplied ox-cart reference image as the visual quality target.

Compare generated results against that reference at both native rendering resolution and actual gameplay display size.

Identify differences in material credibility, edge treatment, shading, texture hierarchy, and perceived depth.

Do not claim visual equivalence based solely on matching resolution, color palette, or texture density.
