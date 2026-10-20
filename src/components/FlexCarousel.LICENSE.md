Adapted from React Bits FlexCarousel TS/CSS for the studio skills chapter.

Retains the upstream WebGL lens/bend, spring/inertia rail, pointer dragging,
horizontal wheel input, introductory animation, and keyboard navigation.
The local adaptation requires supplied items; removes the default remote images
and automatic reduced-motion branches to match the existing dynamic experience;
adds inactive/hidden/offscreen pausing, Chinese accessible labels, a readable
WebGL failure fallback, and explicit GPU cleanup.

Natural fit removes the original 8% image zoom. Every card shares one cardH;
only width follows image aspect ratio. The widest image also limits that common
height so a centered project/certificate can remain fully visible in a narrow
stage. focusOnClick=false prevents an individual card from enlarging.
Optional item aspectRatio dimensions initialize the rail before image decoding.
The WebGL failure fallback uses the same maximum aspect and shared-height rule;
missing dimensions are loaded only for that fallback. The studio chooses zero
bend, zero squeeze and fade intro so displayed image tops/bottoms stay aligned
while horizontal dragging, spring settling and wheel/keyboard movement remain.

Sources retrieved 2026-10-06 from commit ca44b3f9ee180676a06d7de8ec6bea84cddff85b:
- https://reactbits.dev/components/flex-carousel
- https://github.com/DavidHDev/react-bits/tree/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/src/ts-default/Components/FlexCarousel
- https://github.com/DavidHDev/react-bits/blob/ca44b3f9ee180676a06d7de8ec6bea84cddff85b/LICENSE.md

The upstream license below is reproduced verbatim, including its Commons Clause restriction.

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
