import { SvgPath } from './svg.js';
import { BSpline } from './spline.js';
import { Point } from './point.js';
import { CompositeCubicBezier, CubicBezier } from './bezier.js';

let path = 'M 0 -1 C 1 1 3 1 8 -3';
let svgPath = new SvgPath(path);
let curve = svgPath.toCubicBeziers();
let q = curve.toQuadraticBezier();
console.log(q.toCubicBezier());
let offsetComp = curve.offset(-1);
console.log(offsetComp.toSvg());

// let offsets = curves.map((c) => c.offset(1)).flat();
// console.log(curves.map((c) => c.offset(1)))
// console.log(offsets.map((c) => c.toSvg()).join(' '));

let p1 = new Point(1, 2);
let p2 = new Point(2, 3);
let p3 = new Point(3, 4);
let p4 = new Point(4, 5);
let p5 = new Point(5, 6);
let p6 = new Point(6, 7);
let p7 = new Point(7, 8);
let p8 = new Point(8, 9);
let c1 = new CubicBezier(p1, p2, p3, p4);
let c2 = new CubicBezier(p5, p6, p7, p8);

// const bSpline = new BSpline(new Point(0, 0), new Point(3, 3), new Point(6, 3), new Point(12, 0), new Point(15, 3), new Point(9, 6));

// console.log(BSpline.interpolateFromPoints(new Point(1, -1), new Point(-1, 2), new Point(1, 4), new Point(4, 3), new Point(7, 5)).toSvg());

let ccb1 = new CompositeCubicBezier(c1, c2)
let ccb2 = new CompositeCubicBezier([ c1, c2 ])
let ccb4 = new CompositeCubicBezier(p1, p2, p3, p4, p5, p6, p7, p8)
let ccb5 = new CompositeCubicBezier([ p1, p2, p3, p4, p5, p6, p7, p8 ])

// console.log('multiple (2) CubicBezier: ', ccb1)
// console.log('array of CubicBezier: ', ccb2)
// console.log('multiple (8) Point: ', ccb4)
// console.log('array of Point: ', ccb5)

// console.log(bSpline);
// console.log(bSpline.toSvg());