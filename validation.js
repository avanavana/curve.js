import { Point } from './point.js';
import { CubicBezier } from './bezier.js';
import { svgTestString } from './svg.js';

function isEven(x) {
	return x % 2 === 0;
}

function isNullish(x) {
  return x === undefined || x === null;
}

function isFiniteNumber(x) {
  const n = Array.isArray(x) ? NaN : Number.parseFloat(x);
  return typeof n === 'number' && !Number.isNaN(n) && Number.isFinite(n);
}

function isPoint(x) {
  return x instanceof Point;
}

function isPointLikeObject(x) {
  return typeof x === 'object' &&
	!Array.isArray(x) &&
	!isNullish(x) &&
    !isNullish(Object.values(x)[0]) &&
	!isNullish(Object.values(x)[1]) &&
	'x' in x && isFiniteNumber(x.x) &&
	'y' in x && isFiniteNumber(x.y) &&
	Object.keys(x).length === 2;
}

function isPointLikeArray(x) {               
  return Array.isArray(x) &&
	x.length === 2 &&
	x.every((x) => isFiniteNumber(x));
}

function isPointLike(x) {
  return isPoint(x) ||
	isPointLikeObject(x) ||
	isPointLikeArray(x);
}

function isCubicBezier(x) {
  return x instanceof CubicBezier;
}

function isArrayOf4PointLikes(x) {
  return Array.isArray(x) &&
	x.length === 4 &&
	x.every(isPointLike);
}

function isArrayOfMod4PointLikes(x) {
  return Array.isArray(x) &&
    x.length !== 0 &&
    x.length % 4 === 0 &&
    x.every(isPointLike);
}

function isArrayOfMultipleItems(x, n = 1) {
  if (n < 1) n = 1;
  return Array.isArray(x) && x.length > n;
}

function isAllSamePoint(x) {
  return new Set([ ...x ].map((x) => `${Object.values(x)[0]} ${Object.values(x)[1]}`)).size === 1;
}

function pointsFromArgs(x) {
  return isEven(x.length)
	? x.reduce((a, _, i, r) => isEven(i) ? [ ...a, [ r[i], r[i + 1] ] ] : a, [])
	: x;
}

function isSvgPathString(x) {
  return new RegExp(svgTestString, 'gm').test(x);
}

function isValidSvgPathArgs(...args) {
  return args.length === 1 &&
    typeof args[0] === 'string' &&
	isSvgPathString(args[0]);
}

function isNotValidSvgPathArgs(...args) {
  return !args.length ||
	args.length > 1 ||
	typeof args[0] !== 'string' ||
	!isSvgPathString(args[0]);
}

function isValidPointArgs(args) {
  return (args.length === 1 || args.length === 2) &&
	!isNullish(args[0]) &&
	(
	  isNullish(args[1])
		? (isPointLikeObject(args[0]) || isPointLikeArray(args[0]))
		: (isFiniteNumber(args[0]) && isFiniteNumber(args[1]))
	);
}

function isNotValidPointArgs(args) {
  return args.length === 0 ||
	args.length > 2 ||
	isNullish(args[0]) ||
	(
	  isNullish(args[1]) 
	  ? (!isPointLikeObject(args[0]) && !isPointLikeArray(args[0])) 
	  : (!isFiniteNumber(args[0]) || !isFiniteNumber(args[1]))
	);
}

function isValidLineArgs(args) {
  return (
	  (args.length === 1 && isArrayOf4PointLikes(args)) ||
	  (args.length === 2 && args.every(isPointLike)) ||
	  (args.length === 4 && args.every(isFiniteNumber))
    ) &&
    !isAllSamePoint(args.length === 4 ? pointsFromArgs(args) : args);
}

function isNotValidLineArgs(args) {
  return (
	  !(args.length === 1 && isArrayOf4PointLikes(args)) &&
	  !(args.length === 2 && args.every(isPointLike)) &&
	  !(args.length === 4 && args.every(isFiniteNumber))
	) ||
	isAllSamePoint(args.length === 4 ? pointsFromArgs(args) : args);
}

function isValidCubicBezierArgs(args) {
  return isArrayOf4PointLikes(args) && !isAllSamePoint(args);
}

function isNotValidCubicBezierArgs(args) {
  return !isArrayOf4PointLikes(args) || isAllSamePoint(args);
}

function isValidCompositeCubicBezierArgs(args) {
  return (
	isArrayOfMultipleItems(args) &&
	(
	  args.every(isCubicBezier) ||
	  (
		isArrayOfMod4PointLikes(args) &&
		args.length >= 4 &&
		!isAllSamePoint(args))
	)
  );
}

function isNotValidCompositeCubicBezierArgs(args) {
  return (
	!isArrayOfMultipleItems(args) ||
	(
	  args.length > 1 &&
	  !args.every(isCubicBezier) &&
	  (
		!isArrayOfMod4PointLikes(args) ||
		args.length < 4 ||
		isAllSamePoint(args)
	  )
	)
  );
}

function isValidBSplineArgs(args) {
  return isArrayOfMultipleItems(args, 2) &&
	args.every(isPointLike) &&
	!isAllSamePoint(args);
}

function isNotValidBSplineArgs(args) {
  return !isArrayOfMultipleItems(args, 2) ||
	!args.every(isPointLike) ||
	isAllSamePoint(args);
}

export {
  isValidSvgPathArgs,
  isNotValidSvgPathArgs,
  isValidPointArgs,
  isNotValidPointArgs,
  isValidLineArgs,
  isNotValidLineArgs,
  isValidCubicBezierArgs,
  isNotValidCubicBezierArgs,
  isValidCompositeCubicBezierArgs,
  isNotValidCompositeCubicBezierArgs,
  isValidBSplineArgs,
  isNotValidBSplineArgs,
  isPoint,
  isPointLikeArray,
  isPointLikeObject,
  isCubicBezier,
  isNullish,
  isFiniteNumber 
};
