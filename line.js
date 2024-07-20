import { Point } from './point.js';

class Line {
  constructor(p, q) {
	this.p = p || new Point(0, 0);
	this.q = q || new Point(0, 1);
	this.slope = (this.q.y - this.p.y) / (this.q.x - this.p.x);
	this.intercept = this.p.y - this.slope * this.p.x;
	const x = this.q.x - this.p.x, y = this.q.y - this.p.y, d = Math.sqrt( x + y * y);
	this.normal = { dx: -y / d, dy: x / d, slope: -y / x };
	this.length = d;
  }

  static intersectionOf(a, b, { restrictToSegments } = { restrictToSegments: false }) {
	if ( // a or b are points, not lines
	  (a.p.x === a.q.x && a.p.y === a.q.y) ||
	  (b.p.x === b.q.x && b.p.y === b.q.y)
	) return null;

	const d = (b.q.y - b.p.y) * (a.q.x - a.p.x) - (b.q.x - b.p.x) * (a.q.y - a.p.y);
	
	if (d === 0) return null; // a and b are the same point
	
	const ua = ((b.q.x - b.p.x) * (a.p.y - b.p.y) - (b.q.y - b.p.y) * (a.p.x - b.p.x)) / d;

	if (restrictToSegments) {
	  const ub = ((a.q.x - a.p.x) * (a.p.y - b.p.y) - (a.q.y - a.p.y) * (a.p.x - b.p.x)) / d;
		
	  if ( // a and b do not intersect within their provided line segments
		ua < 0 || ua > 1 || ub < 0 || ub > 1
	  ) return null; 
	}

	return new Point(
	  a.p.x + ua * (a.q.x - a.p.x),
	  a.p.y + ua * (a.q.y - a.p.y)
	);
  }

  offset(d) {
	if (typeof parseFloat(d) !== 'number' ||
	  Number.isNaN(parseFloat(d)) ||
	  !Number.isFinite(parseFloat(d))
	) throw new Error('Argument "d" must be a number.');

	return new Line(
	  new Point(this.p.x - this.normal.dx * parseFloat(d), this.p.y - this.normal.dy * parseFloat(d)),
	  new Point(this.q.x - this.normal.dx * parseFloat(d), this.q.y - this.normal.dy * parseFloat(d))
	);
  }

  toSvg({ closePath } = { closePath: false }) {
	return `M ${this.p.x} ${this.p.y} L ${this.q.x} ${this.q.y}` + (closePath ? ' Z' : '');
  }
}

export { Line };
