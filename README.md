# Seam Carving
Content-Aware Image Resizing

**Demo**: https://an-w.github.io/seam-carving/

## Introduction
Implementation of [Seam Carving for Content-Aware Image Resizing](http://graphics.cs.cmu.edu/courses/15-463/2012_fall/hw/proj3-seamcarving/imret.pdf)  by Avidan and Shamir. This algorithm allows images to be resized without distorion or loss of content from scaling or cropping. This is done by finding the lowest energy vertical or horizontal seam (connected path of pixels) and then carving (removing) it. This process is repeated until the desired height or width is reached. For seam insertion (increasing size), the seam would be duplicated rather than removed.


## Examples
A few examples to demonstrate both carving and insertion of vertical and horizontal seams.

### Carving

![balloons](/public/balloons.jpg) ![balloons](/public/balloons-after.jpg)

gif:

<img src="public/balloons.gif" alt="drawing" width="400"/>


### Insertion

![lemons](/public/lemons.png) ![balloons](/public/lemons-after.png)

gif:

<img src="public/lemons.gif" alt="drawing" width="400"/>