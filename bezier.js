import { Point } from './point.js';
import { Line } from './line.js';
import { distance, lerp  } from './utils.js';
import { isValidCubicBezierArgs, isValidCompositeCubicBezierArgs, isCubicBezier } from './validation.js';

class QuadraticBezier {
  constructor(...args) {
	const p = args.length > 1 ? [ ...args ] : Array.isArray(args) ? args.flat() : args;
    this.points = p;
    this.controlPoints = p.slice(1, 2);
  }

  toCubicBezier() {
	const p = [ ...this.points ];

    return new CubicBezier([
	  p[0],
	  new Point(p[0].x + (2 / 3) * (p[1].x - p[0].x), p[0].y + (2 / 3) * (p[1].y - p[0].y)),
	  new Point(p[2].x + (2 / 3) * (p[1].x - p[2].x), p[2].y + (2 / 3) * (p[1].y - p[2].y)),
	  p[2]
	]);
  }

  toSvg({ closePath } = { closePath: false }) {
	const p = [ ...this.points ];
	return `M ${p[0].x} ${p[0].y} Q ${p.slice(1).map(({ x, y }) => x + ' ' + y).join(' ')}` + (closePath ? ' Z' : '');
  }
}

class CubicBezier {
  static #TOLERANCE_THRESHOLD = 50;

  constructor(...args) {
  	const p = args.length > 1 ? [ ...args ] : Array.isArray(args) ? args.flat() : args;
	if (!isValidCubicBezierArgs) throw new Error('The CubicBezier constructor accepts either four arguments of type "Point { x: number, y: number }", or a single argument consisting of type "[ Point, Point, Point, Point ]".');	
	this.points = p;
	this.controlPoints = p.slice(1, 3);
	this.length = (distance(p[0], p[3]) + (distance(p[0], p[1]) + distance(p[1], p[2]) + distance(p[2], p[3]))) / 2;
	this.flatness = this.#calculateFlatness();
	this.isSufficientlyFlat = this.flatness <= CubicBezier.#TOLERANCE_THRESHOLD;
  }

  static setToleranceThreshold(value) {
	CubicBezier.#TOLERANCE_THRESHOLD = value;
  }

  #calculateOffsets(offset) {
	const offsets = [],
		  subcurves = this.isSufficientlyFlat
		  ? [ this ]
		  : this.subdivide().every((c) => c.isSufficientlyFlat)
			? this.subdivide()
			: this.subdivide().map((c) => c.subdivide()).flat();

	subcurves.forEach((subcurve) => {
	  const q0_q1 = new Line(subcurve.points[0], subcurve.points[1]).offset(offset);
	  const q1_q2 = new Line(subcurve.points[1], subcurve.points[2]).offset(offset);
	  const q2_q3 = new Line(subcurve.points[2], subcurve.points[3]).offset(offset);
		
	  const q1 = Line.intersectionOf(q0_q1, q1_q2);
	  const q2 = Line.intersectionOf(q1_q2, q2_q3);
		
	  offsets.push(new CubicBezier(new Point(q0_q1.p.x, q0_q1.p.y), new Point(q1.x, q1.y), new Point(q2.x, q2.y), new Point(q2_q3.q.x, q2_q3.q.y)));
	});

	return offsets;
  }

  #calculateFlatness() {
	const p = [ ...this.points ];

	let ux = Math.pow(3 * p[1].x - 2 * p[0].x - p[3].x, 2),
		uy = Math.pow(3 * p[1].y - 2 * p[0].y - p[3].y, 2),
		vx = Math.pow(3 * p[2].x - 2 * p[3].x - p[0].x, 2),
		vy = Math.pow(3 * p[2].y - 2 * p[3].y - p[0].y, 2);

	let e = Math.floor(Math.max(...p.map(({ x, y }) => Math.max(x, y)))).toString().length - 1;

	if (ux < vx) ux = vx;
	if (uy < vy) uy = vy;

	return (ux + uy) / Math.pow(10, e);
  }

  subdivide() {
	const p = [ ...this.points ];

	const a = lerp(p[0], p[1]),
		  b = lerp(p[1], p[2]),
		  c = lerp(p[2], p[3]),
		  d = lerp(a, b),
		  e = lerp(b, c),
		  m = lerp(d, e);

	return new CompositeCubicBezier(new CubicBezier(p[0], a, d, m), new CubicBezier(m, e, c, p[3]));
  }

  pointAt(t) {
	if (!t || typeof t !== 'number' || Number.isNaN(t) || t < 0 || t > 1) throw new Error('Required parameter "t" must be a number 0 <= t <= 1.');
	const p = [ ...this.points ];

	let a = (1 - t) * (1 - t) * (1 - t),
		b = 3 * (1 - t) * (1 - t) * t,
		c = 3 * (1 - t) * t * t,
		d = t * t * t;

	return new Point(
	  a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
	  a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
	);
  }

  derivativeAt(t) {
	if (t === undefined || t === null || typeof t !== 'number' || Number.isNaN(t) || t < 0 || t > 1) throw new Error('Required parameter "t" must be a number 0 <= t <= 1.');
	const p = [ ...this.points ];

	if (t > 1) t = 1;
	else if (t < 0) t = 0;

	let a = 3 * (1 - t) * (1 - t),
		b = 6 * (1 - t) * t,
		c = 3 * t * t;

	return {
	  dx: a * (p[1].x - p[0].x) + b * (p[2].x - p[1].x) + c * (p[3].x - p[2].x),
	  dy: a * (p[1].y - p[0].y) + b * (p[2].y - p[1].y) + c * (p[3].y - p[2].y)
	};
  }

  normalAt(t) {
	if (t === undefined || t === null || typeof t !== 'number' || Number.isNaN(t) || t < 0 || t > 1) throw new Error('Required parameter "t" must be a number 0 <= t <= 1.');
	const { dx: x, dy: y } = this.derivativeAt(t), d = Math.sqrt(x * x + y * y);
	return { dx: -y / d, dy: x / d, slope: -y / x };
  }

  offset(d) {
	if (typeof parseFloat(d) !== 'number' || Number.isNaN(parseFloat(d)) || !Number.isFinite(parseFloat(d))) throw new Error('Argument "d" must be a number.');
    const offsets = [],
	  subcurves = this.isSufficientlyFlat
	    ? [ this ]
	    : this.subdivide().curves.every((c) => c.isSufficientlyFlat && c.length > Math.abs(d) * 10)
		  ? this.subdivide().curves
		  : this.subdivide().curves.map((c) => c.subdivide().curves).flat();

	subcurves.forEach((s) => {
	  const q0_q1 = new Line(s.points[0], s.points[1]).offset(d);
	  const q1_q2 = new Line(s.points[1], s.points[2]).offset(d);
	  const q2_q3 = new Line(s.points[2], s.points[3]).offset(d);

	  const q1 = Line.intersectionOf(q0_q1, q1_q2);
	  const q2 = Line.intersectionOf(q1_q2, q2_q3);
		
	  offsets.push(new CubicBezier(new Point(q0_q1.p.x, q0_q1.p.y), new Point(q1.x, q1.y), new Point(q2.x, q2.y), new Point(q2_q3.q.x, q2_q3.q.y)));
	});

	return new CompositeCubicBezier(...offsets);
  }

  toQuadraticBezier() {
	const p = [ ...this.points ];

	const v0 = new Point(p[1].x - p[0].x, p[1].y - p[0].y);
	const v1 = new Point(p[2].x - p[3].x, p[2].y - p[3].y);

	const dx = p[3].x - p[0].x;
	const dy = p[3].y - p[0].y;
	const det = v1.x * v0.y - v1.y * v0.x;
	const u = (dy * v1.x - dx * v1.y) / det;
	const v = (dy * v0.x - dx * v0.y) / det;
	  
	if (u < 0 || v < 0) throw new Error('Cannot convert this CubicBezier to Quadratic.');

	const m0 = v0.y / v0.x;
	const m1 = v1.y / v1.x;
	const b0 = p[0].y - m0 * p[0].x;
	const b1 = p[3].y - m1 * p[3].x;
	const x = (b1 - b0) / (m0 - m1);
	const y = m0 * x + b0;

	if (!Number.isFinite(x)) throw new Error('Cannot convert this CubicBezier to Quadratic.');
	  
	return new QuadraticBezier([
	  p[0],
      new Point(x, y),
	  p[3]
	]);
  }

  toSvg({ closePath } = { closePath: false }) {
	const p = [ ...this.points ];
	return `M ${p[0].x} ${p[0].y} C ${p.slice(1).map(({ x, y }) => x + ' ' + y).join(' ')}` + (closePath ? ' Z' : '');
  }
}

class CompositeCubicBezier {
  constructor(...args) {
    let input = args.length > 1 ? [ ...args ] : Array.isArray(args) ? args.flat() : args;
	if (!isValidCompositeCubicBezierArgs(input)) throw new Error('The CompositeCubicBezier constructor accepts only multiple arguments of type "CubicBezier", multiple (mod 4) arguments of type "Point", a single argument of type "CubicBezier[]", or a single argument of type "Point[]" with length mod 4.');
	this.curves = [];
	  
	if (input.every(isCubicBezier)) {
	  this.curves.push(...input);
	} else {
	  while (input.length) this.curves.push(new CubicBezier(...input.splice(0, 4)));
	}
	  
	this.segments = this.curves.length;
	this.length = this.curves.reduce((a, c) => a + c.length, 0);
  }

  offset(d) {
	if (typeof parseFloat(d) !== 'number' || Number.isNaN(parseFloat(d)) || !Number.isFinite(parseFloat(d))) throw new Error('Argument "d" must be a number.');
	return new CompositeCubicBezier(...this.curves.map((c) => c.offset(d).curves).flat());
  }

  toSvg({ closePath } = { closePath: false }) {
	return this.curves.map((c, i) => {
		const points = [ ...c.points ];
		const m = i === 0 ? `M ${Object.values(points.slice(0, 1)[0]).join(' ')} ` : '';
		return `${m}C ${points.slice(1, points.length).map(({ x, y }) => x + ' ' + y).join(' ')}`;
	}).join(' ') + (closePath ? ' Z' : ''); 
  }
}

export { CubicBezier, CompositeCubicBezier }; 
