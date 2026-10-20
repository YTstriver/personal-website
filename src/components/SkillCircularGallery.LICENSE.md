Adapted from React Bits Circular Gallery TS/CSS for the studio skill materials.

The official OGL perspective camera, subdivided image planes, vertex wave shader, circular arc positioning/rotation, inertia easing, and looping gallery are retained. The adaptation uses locally supplied materials, source image aspect ratios, PNG source alpha, bounded transparent rendering, and warm native captions/controls. Pointer gestures are local to the gallery; vertical scrolling remains available to the chapter. Native controls provide sequential access to every image and document activation with a stable return-focus element. Disabled, offscreen, and hidden galleries stop their render loop; unmount disposes GL resources. The fallback keeps image browsing and native controls available when WebGL is unavailable.

Sources:
- https://www.reactbits.dev/components/circular-gallery
- https://www.reactbits.dev/r/CircularGallery-TS-CSS.json
- https://github.com/DavidHDev/react-bits/tree/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/src/ts-default/Components/CircularGallery
- https://github.com/DavidHDev/react-bits/blob/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/LICENSE.md

The unmodified registry/source/license snapshot is saved in `output/studio-motion/skill-circular-gallery/upstream`.

The upstream license below is reproduced verbatim. It includes the Commons Clause restriction.

---

MIT + Commons Clause License Condition v1.0

Copyright (c) 2026 David Haz

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, and distribute the Software **as part of an application, website, or product**, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

## Commons Clause Restriction

You may use this Software, including for any commercial purpose, **so long as you do not sell, sublicense, or redistribute the components themselves-whether alone, in a bundle, or as a ported version.**

## No Warranty

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
