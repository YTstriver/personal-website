Adapted from React Bits Masonry TS/CSS for the studio skill material folders.

The official absolutely positioned masonry items, GSAP staggered entry/reflow, blur-to-focus entry, and 0.97 hover scaling are retained. Icon collections and ordinary materials use the original shortest-column placement. The application may select a three-column project document arrangement with a portrait spanning the first two rows, or a four-column BIM document arrangement with two portrait rows and two stacked landscape images at the lower right. Document rows share explicit positions and landscape height baselines, preserving native image ratios without crop. The adaptation measures the parent content width and height, optionally accepts a fixed column count, compares two through four columns for other larger groups, and uses three columns for icon groups of six or fewer. Each complete group is uniformly scaled and centered inside the measured area with no internal scroll. Images have the upstream 10px corner radius and transparent styling. Icon images are centered at 72% of their existing hit area, retaining the original item grid and document sizes. Labels and optional descriptions appear only on hover or keyboard focus in a separate bounded gallery tooltip, so small images do not truncate the text. Mouse tooltips follow the pointer below it with at most one requestAnimationFrame update per frame, clamp to the gallery bounds, and hide after mouse clicks; keyboard focus retains item-anchored positioning. Disabled items hide the tooltip, and cleanup cancels pending tooltip frames. Document buttons activate the application's existing image viewer with their own DOM element as the return-focus target; icons are keyboard-focusable and remain browse-only. Images load natively and fade in individually. The component does not open external URLs, preload a remote image collection, add a canvas, or install new dependencies. Reduced motion skips entry/hover animation. Cleanup disconnects observers/listeners and kills owned GSAP tweens while preserving the final item coordinates during reflow.

Sources:
- https://www.reactbits.dev/components/masonry
- https://www.reactbits.dev/r/Masonry-TS-CSS.json
- https://github.com/DavidHDev/react-bits/tree/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/src/ts-default/Components/Masonry
- https://github.com/DavidHDev/react-bits/blob/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/LICENSE.md

The unmodified registry/source/license snapshot is saved in `output/studio-motion/skill-masonry/upstream`.

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
