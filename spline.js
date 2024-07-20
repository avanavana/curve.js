import { isValidBSplineArgs } from './validation.js';
import { createSplineCoefficientMatrix, multiplyMatrices, invertMatrix, cleanDecimal } from './utils.js';

import { Point } from './point.js';
import { CubicBezier } from "./bezier.js";

class BSpline {
  constructor(...input) {
	const curves = [], b = input.length > 1 ? [ ...input ] : Array.isArray(input) ? input.flat() : input;
	if (!isValidBSplineArgs(b)) throw new Error('The BSpline constructor accepts either n >= 3 arguments of type "Point { x: number | string, y: number | string }" (where string is able to be coerced to a number), or a single argument consisting of type "Point[]" (length >= 3.');
	  
	for (let i = 0; i < b.length - 1; i++) {
      curves.push(new CubicBezier(
	    i === 0 ? b[0] : curves[i - 1].points[3],
		Point.sumPoints(new Point(b[i]).multiplyBy(2 / 3), new Point(b[i + 1]).multiplyBy(1 / 3)),
		Point.sumPoints(new Point(b[i]).multiplyBy(1 / 3), new Point(b[i + 1]).multiplyBy(2 / 3)),
		i === b.length - 2 ? b[b.length - 1] : Point.sumPoints(new Point(b[i]).multiplyBy(1 / 6), new Point(b[i + 1]).multiplyBy(2 / 3), new Point(b[i + 2]).multiplyBy(1 / 6))
	  ));

	}

	this.curves = curves;
  }

  static interpolateFromPoints(...input) {
	const s = input.length > 1 ? [ ...input ] : Array.isArray(input) ? input.flat() : input;
  	if (!isValidBSplineArgs(s)) throw new Error('The BSpline constructor accepts either n >= 3 arguments of type "Point { x: number | string, y: number | string }" (where string is able to be coerced to a number), or a single argument consisting of type "Point[]" (length >= 3.');
	const M = createSplineCoefficientMatrix(s.length - 2);
	const Minv = invertMatrix(M);
	const C = [];

    for (let i = 0; i < s.length; i++) {
	  if (i === 0) C.push([ 6 * s[1].x - s[0].x, 6 * s[1].y - s[0].y ]);
	  else if (i === 1 || i == s.length - 2) continue;
	  else if (i === s.length - 1) C.push([ 6 * s[s.length - 2].x - s[s.length - 1].x, 6 * s[s.length - 2].y - s[s.length - 1].y ]);
	  else C.push([ 6 * s[i].x, 6 * s[i].y ]);
	}
	const B = multiplyMatrices(Minv, C);
	B.unshift([ s[0].x, s[0].y ]);
	B.push([ s[s.length - 1].x, s[s.length - 1].y ]);
	return new BSpline(...B.map((p) => new Point(...p.map(cleanDecimal))));
  }

  toSvg({ closePath } = { closePath: false }) {
	return this.curves.map(({ points: c }, i) => {
		const m = i === 0 ? `M ${Object.values(c.splice(0, 1)[0]).join(' ')} ` : '';
		return `${m}C ${c.slice(i === 0 ? 0 : 1, c.length).map(({ x, y }) => x + ' ' + y).join(' ')}`;
	}).join(' ') + (closePath ? ' Z' : '');
  }
}

export { BSpline };