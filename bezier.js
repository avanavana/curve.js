import { Point } from './point.js';
import { Line } from './line.js';
import { distance, lerp, multiplyMatrices, invertMatrix  } from './utils.js';
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
  static #TOLERANCE_THRESHOLD = 2;
  // static #TOLERANCE_THRESHOLD2 = 50;
	
  constructor(...args) {
  	const p = args.length > 1 ? [ ...args ] : Array.isArray(args) ? args.flat() : args;
	if (!isValidCubicBezierArgs) throw new Error('The CubicBezier constructor accepts either four arguments of type "Point { x: number, y: number }", or a single argument consisting of type "[ Point, Point, Point, Point ]".');	
	this.points = p;
	this.controlPoints = p.slice(1, 3);
	this.length = (distance(p[0], p[3]) + (distance(p[0], p[1]) + distance(p[1], p[2]) + distance(p[2], p[3]))) / 2;
	this.flatness = this.#calculateFlatness();
	this.isSufficientlyFlat = this.flatness <= CubicBezier.#TOLERANCE_THRESHOLD;
	// this.flatness2 = this.#calculateFlatness2();
	// this.isSufficientlyFlat2 = this.flatness2 <= CubicBezier.#TOLERANCE_THRESHOLD2u;
  }

  static setToleranceThreshold(value) {
	CubicBezier.#TOLERANCE_THRESHOLD = value;
  }

 //  #calculateOffsets(offset) {
	// const offsets = [],
	//   subcurves = this.isSufficientlyFlat
	//   ? [ this ]
	//   : this.subdivide().every((c) => c.isSufficientlyFlat)
	// 	? this.subdivide()
	// 	: this.subdivide().map((c) => c.subdivide()).flat();

	// subcurves.forEach((subcurve) => {
	//   const q0_q1 = new Line(subcurve.points[0], subcurve.points[1]).offset(offset);
	//   const q1_q2 = new Line(subcurve.points[1], subcurve.points[2]).offset(offset);
	//   const q2_q3 = new Line(subcurve.points[2], subcurve.points[3]).offset(offset);
		
	//   const q1 = Line.intersectionOf(q0_q1, q1_q2);
	//   const q2 = Line.intersectionOf(q1_q2, q2_q3);
		
	//   offsets.push(new CubicBezier(new Point(q0_q1.p.x, q0_q1.p.y), new Point(q1.x, q1.y), new Point(q2.x, q2.y), new Point(q2_q3.q.x, q2_q3.q.y)));
	// });

	// return offsets;
 //  }

  #calculateFlatness() {
	const p = [ ...this.points ],
          dx = p[3].x - p[0].x,
		  dy = p[3].y - p[0].y,
		  d1 = Math.abs((p[1].x - p[3].x) * dy - (p[1].y - p[3].y) * dx),
		  d2 = Math.abs((p[2].x - p[3].x) * dy - (p[2].y - p[3].y) * dx);

	return ((d1 + d2) * (d1 + d2)) / (dx * dx + dy * dy);
  }
	
  #calculateOffset(d) {
	const p = [ ...this.points ];

	const s0 = p[1].subtractPointFrom(p[0]);
	const s3 = p[3].subtractPointFrom(p[2]);

	const a = Point.sumPoints(s0.multiplyBy(3), s3.multiplyBy(3), p[3].subtractPointFrom(p[0]).multiplyBy(-2));
	const b = Point.sumPoints(s0.multiplyBy(-6), s3.multiplyBy(-3), p[3].subtractPointFrom(p[0]).multiplyBy(3));
	const c = s0.multiplyBy(3);

	const n0 = new Point(-s0.y, s0.x).divideBy(Math.sqrt(s0.x * s0.x + s0.y * s0.y));
	const n3 = new Point(-s3.y, s3.x).divideBy(Math.sqrt(s3.x * s3.x + s3.y * s3.y));

	const q0 = p[0].addPointTo(n0.multiplyBy(d));
	const q3 = p[3].addPointTo(n3.multiplyBy(d));

	const A = Point.sumPoints(s0.multiplyBy(3), s3.multiplyBy(3), q3.subtractPointFrom(q0).multiplyBy(-2));
	const B = Point.sumPoints(s0.multiplyBy(-6), s3.multiplyBy(-3), q3.subtractPointFrom(q0).multiplyBy(3));
	const C = s0.multiplyBy(3);

	const Pc = Point.sumPoints(a.divideBy(8), b.divideBy(4), c.divideBy(2), p[0]);
	const Qc = Point.sumPoints(A.divideBy(8), B.divideBy(4), C.divideBy(2), q0);

	const dp = Point.sumPoints(a.multiplyBy(3 / 4), b, c);
	const dq = Point.sumPoints(A.multiplyBy(3 / 4), B, C);

	const nc = new Point(-dp.y, dp.x).divideBy(Math.sqrt(dp.x * dp.x + dp.y * dp.y));

	const Rc = Pc.addPointTo(nc.multiplyBy(d));

	const Ma = [
	  [ s0.x, -s3.x, (8 / 3) * dp.x ],
	  [ s0.y, -s3.y, (8 / 3) * dp.y ],
	  [ -s0.x * dp.y + s0.y * dp.x, -s3.x * dp.y + s3.y * dp.x, 4 * ((s0.y - s3.y) * dp.x - (s0.x - s3.x) * dp.y) ]
	];

	const Mb = [
	  [ (8 / 3) * (Rc.x - Qc.x) ],
	  [ (8 / 3) * (Rc.y - Qc.y) ],
	  [ (4 / 3) * (dq.y * dp.x - dq.x * dp.y) ]
	];

	const MaInverted = invertMatrix(Ma);
	if (!MaInverted) return null;
	const [[ dk0 ], [ dk3 ], [ dt ]] = multiplyMatrices(MaInverted, Mb);
	return new CubicBezier(q0, q0.addPointTo(s0.multiplyBy(1 + dk0)), q3.subtractPointFrom(s3.multiplyBy(1 + dk3)), q3);
  }
	
  #calculateFlatness2() {
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
	  
	return {
	  dx: -y / d,
	  dy: x / d,
	  slope: -y / x
	};
  }

 //  offset(d) {
	// if (typeof parseFloat(d) !== 'number' || Number.isNaN(parseFloat(d)) || !Number.isFinite(parseFloat(d))) throw new Error('Argument "d" must be a number.');
 //    const offsets = [],
	//   subcurves = this.isSufficientlyFlat
	//     ? [ this ]
	//     : this.subdivide().curves.every((c) => c.isSufficientlyFlat)
	// 	  ? this.subdivide().curves
	// 	  : this.subdivide().curves.map((c) => c.subdivide().curves).flat();

	// subcurves.forEach((s) => {
	//   const q0_q1 = new Line(s.points[0], s.points[1]).offset(d);
	//   const q1_q2 = new Line(s.points[1], s.points[2]).offset(d);
	//   const q2_q3 = new Line(s.points[2], s.points[3]).offset(d);

	//   const q1 = Line.intersectionOf(q0_q1, q1_q2);
	//   const q2 = Line.intersectionOf(q1_q2, q2_q3);

	//   if (!q1 || !q2) console.log('offending line: ', s.points)
		
	//   offsets.push(!q1 || !q2 ? s : new CubicBezier(new Point(q0_q1.p.x, q0_q1.p.y), new Point(q1.x, q1.y), new Point(q2.x, q2.y), new Point(q2_q3.q.x, q2_q3.q.y)));
	// });
	  
	// return offsets.length === 1 ? offsets[0] : new CompositeCubicBezier(...offsets);
 //  }

  offset(d) {
	if (typeof parseFloat(d) !== 'number' || Number.isNaN(parseFloat(d)) || !Number.isFinite(parseFloat(d))) throw new Error('Argument "d" must be a number.');
	const offsets = [],
	  subcurves = this.isSufficientlyFlat
		? [ this ]
		: this.subdivide().curves.every((c) => c.isSufficientlyFlat)
		  ? this.subdivide().curves
		  : this.subdivide().curves.map((c) => c.subdivide().curves).flat();

	subcurves.forEach((s) => { 
	  const offset = s.#calculateOffset(d);
	  if (offset) offsets.push(offset);
	});
	  
	return !offsets.length ? null : offsets.length === 1 ? offsets[0] : new CompositeCubicBezier(...offsets);
  }

  toQuadraticBezier() {
	const p = [ ...this.points ];

	const v0 = new Point(p[1].x - p[0].x, p[1].y - p[0].y);
	const v1 = new Point(p[2].x - p[3].x, p[2].y - p[3].y);

	const dx = p[3].x - p[0].x;
	const dy = p[3].y - p[0].y;
	const d = v1.x * v0.y - v1.y * v0.x;
	const u = (dy * v1.x - dx * v1.y) / d;
	const v = (dy * v0.x - dx * v0.y) / d;
	  
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
	const compositeOffsets = [];

  	this.curves.forEach((c) => {
	  const offsets = c.offset(d);
	  if (offsets) compositeOffsets.push(offsets instanceof CubicBezier ? [ offsets ] : offsets.curves)
	});
	  
	return new CompositeCubicBezier(...compositeOffsets.flat());
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
