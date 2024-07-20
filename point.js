import { isPoint, isPointLikeArray, isPointLikeObject, isFiniteNumber } from './validation.js';

class Point {
  constructor(x, y){
	if ((y === undefined || y === null) && (isPointLikeObject(x) || isPointLikeArray(x))) {
	  this.x = Number.parseFloat(Object.values(x)[0]) || 0;
	  this.y = Number.parseFloat(Object.values(x)[1]) || 0;
	} else {
	  this.x = Number.parseFloat(x) || 0;
	  this.y = Number.parseFloat(y) || 0;
	}
  }

  static sumPoints(...addends) {
	if (!addends.flat().every((point) => isPoint(point) || isPointLikeObject(point))) {
	  throw new Error('Arguments must be either two or  more of type "Point { x: number, y: number }" or a Point-like object, an array of type Point {x: number, y: number } or Point-like objects.');
	}

	return addends.flat().reduce((a, { x, y }) => a.addPointTo({ x, y }), new Point(0, 0));
  }

  static differencePoints(minuend, subtrahend) {
	if ((!isPoint(minuend) && !isPointLikeObject(minuend) && !isPointLikeArray(minuend))
	  || (!isPoint(subtrahend) && !isPointLikeObject(subtrahend) && !isPointLikeArray(subtrahend))
	) {
	  throw new Error('Arguments "minuend" and "subtrahend" must both be of type "Point { x: number, y: number }".');
	}

	return new Point(Object.values(minuend)[0] - Object.values(subtrahend)[0], Object.values(minuend)[1] - Object.values(subtrahend)[1]);
  }

  addPointTo(...addends) {
	if ((addends.length === 1 && !isPoint(addends[0]) && !isPointLikeObject(addends[0]) && !isPointLikeArray(addends[0]))
	  || (addends.length === 2 && !addends.every(isFiniteNumber))
	  || addends.length > 2
	  || !addends.length
	) {
	  throw new Error('Method "addTo()" must be called with one of: a single argument of type "Point { x: number, y: number }", a single argument of type "object" with two numeric properties "x" and "y", or two arguments, each of type "number".');
	}

	return addends.length === 1
	  ? Array.isArray(addends[0])
		? new Point(this.x + addends[0][0], this.y + addends[0][1])
		: new Point(this.x + addends[0].x, this.y + addends[0].y)
	  : new Point(this.x + addends[0], this.y + addends[1]);
  }

  subtractPointFrom(subtrahend) {
	if (!isPoint(subtrahend)
	  && !isPointLikeObject(subtrahend)
	  && !isPointLikeArray(subtrahend)
	) {
	  throw new Error('Method "subtractFrom()" must be called with one of: a single argument of type "Point { x: number, y: number }", a single argument of type "object" with two numeric properties "x" and "y", or two arguments, each of type "number".');
	}

	return new Point(this.x - Object.values(subtrahend)[0], this.y - Object.values(subtrahend)[1]);
  }

  addTo(addend) {
	return new Point(this.x + addend, this.y + addend);
  }

  subtractFrom(subtrahend) {
	return new Point(this.x - subtrahend, this.y - subtrahend);
  }

  multiplyBy(multiplier) {
	return new Point(this.x * multiplier, this.y * multiplier);
  }

  divideBy(divisor) {
	return new Point(this.x / divisor, this.y / divisor);
  }

  toPower(exponent) {
	return new Point(Math.pow(this.x, exponent), Math.pow(this.y, exponent));
  }
}

export { Point };
