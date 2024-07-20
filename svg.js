import { Point } from './point.js';
import { CubicBezier, CompositeCubicBezier } from './bezier.js';
import { isValidSvgPathArgs } from './validation.js';

const SvgPathFormats = Object.freeze({
  PATH_STRING: Symbol.for('path_string'),
  CUBIC_BEZIER_CURVES:  Symbol.for('cubic_bezier_curves'),
  COMMAND_LIST: Symbol.for('command_list')
});

const SvgCommands = Object.freeze({
  // ELLIPTICAL_ARC_TO: Symbol.for('A'),
  CURVE_TO: Symbol.for('C'),
  HORIZONTAL_LINE_TO: Symbol.for('H'),
  LINE_TO: Symbol.for('L'),
  MOVE_TO: Symbol.for('M'),
  QUADRATIC_CURVE_TO: Symbol.for('Q'),
  SMOOTH_CURVE_TO: Symbol.for('S'),
  SMOOTH_QUADRATIC_CURVE_TO: Symbol.for('T'),
  VERTICAL_LINE_TO: Symbol.for('V'),
  CLOSE_PATH: Symbol.for('Z')
});

const SvgCommandKeys = Object.freeze({
  // A: SvgCommands.ELLIPTICAL_ARC_TO,
  C: SvgCommands.CURVE_TO,
  H: SvgCommands.HORIZONTAL_LINE_TO,
  L: SvgCommands.LINE_TO,
  M: SvgCommands.MOVE_TO,
  Q: SvgCommands.QUADRATIC_CURVE_TO,
  S: SvgCommands.SMOOTH_CURVE_TO,
  T: SvgCommands.SMOOTH_QUADRATIC_CURVE_TO,
  V: SvgCommands.VERTICAL_LINE_TO,
  Z: SvgCommands.CLOSE_PATH
});

const toCubicBezierConversions = new Map([
  // [ SvgCommands.ELLIPTICAL_ARC_TO, (v) => v],
  [ SvgCommands.CURVE_TO, (v) => v ],
  [ SvgCommands.HORIZONTAL_LINE_TO, (v, pf) => [ ...pf, ...v, pf[0], ...v, pf[0] ]],
  [ SvgCommands.LINE_TO, (v, pf) => [ ...pf, ...v, ...v ]],
  [ SvgCommands.MOVE_TO, (v) => v ],
  [ SvgCommands.QUADRATIC_CURVE_TO, (v, pf) => [ pf[0] + 2 / 3 * (v[0] - pf[0]), pf[1] + 2 / 3 * (v[1] - pf[1]), v[2] + 2 / 3 * (v[0] - v[2]), v[3] + 2 / 3 * (v[1] - v[3]), ...v.slice(2) ]],
  [ SvgCommands.SMOOTH_CURVE_TO, (v, pf) => [ ...pf, ...v ]],
  [ SvgCommands.SMOOTH_QUADRATIC_CURVE_TO, (v, pf, pp) => [ pf[0] + 2 / 3 * ((2 * pf[0] - pp[0]) - pf[0]), pf[1] + 2 / 3 * ((2 * pf[1] - pp[1]) - pf[1]), v[0] + 2 / 3 * ((2 * pf[0] - pp[0]) - v[0]), v[1] + 2 / 3 * ((2 * pf[1] - pp[1]) - v[1]), ...v ]],
  [ SvgCommands.VERTICAL_LINE_TO, (v, pf) => [ ...pf, pf[1], ...v, pf[1], ...v ]],
  [ SvgCommands.CLOSE_PATH, (_, pf, __, f) => [ ...pf, ...f, ...f ]]
]);

const svgCommandLengths = new Map([
  // [ SvgCommands.ELLIPTICAL_ARC_TO, 7 ],
  [ SvgCommands.CURVE_TO, 6 ],
  [ SvgCommands.HORIZONTAL_LINE_TO, 1 ],
  [ SvgCommands.LINE_TO, 2 ],
  [ SvgCommands.MOVE_TO, 2 ],
  [ SvgCommands.QUADRATIC_CURVE_TO, 4 ],
  [ SvgCommands.SMOOTH_CURVE_TO, 4 ],
  [ SvgCommands.SMOOTH_QUADRATIC_CURVE_TO, 2 ],
  [ SvgCommands.VERTICAL_LINE_TO, 1 ],
  [ SvgCommands.CLOSE_PATH, 0 ]
]);

const svgTestString = `^(?:[${Object.keys(SvgCommandKeys).join('')}](?:\\s*-?\\d(?:\\.\\d+)?)*\\s*)+$`;

class SvgPath {
  constructor(path) {
	if (!isValidSvgPathArgs(path)) throw new Error('Invalid SVG path. Path must not use the "ELLIPTICAL_ARC_TO (A)" command, nor relative values.');
	this.path = path;
	this.normalizedPath = this.#normalize(SvgPathFormats.PATH_STRING);
	this.normalizedCurves = this.#normalize(SvgPathFormats.CUBIC_BEZIER_CURVES);
	this.normalizedCommands = this.#normalize();
  }

  static splineToSvg(input, { closePath } = { closePath: false }) {
	const curves = Array.isArray(input[0]) ? [ ...input] : [[ ...input ]];

	return curves.map((curve, i) => {
		const m = curve.splice(0, 1);

	  return i === 0
		? `M ${m[0].x} ${m[0].y} C ${curve.map(({ x, y }) => x + ' ' + y).join(' ')}`
		: `C ${curve.slice(1, curve.length).map(({ x, y }) => x + ' ' + y).join(' ')}`;
	}).join(' ') + (closePath ? ' Z' : '');
  }

  #extractCommands() {
	const commands = [], terms = this.path.replace(/\s\s/g, ' ').replace(new RegExp(`([${Object.keys(SvgCommandKeys).join('')}])([0-9])`, 'g'), '$1 $2').split(' ');

	while (terms.length) {
	  const term = terms.splice(0, 1)[0];
	  const values = terms.splice(0, svgCommandLengths.get(SvgCommandKeys[term])).map(parseFloat);
	  if (!values.every((v) => !Number.isNaN(v))) throw new Error('Invalid SVG path.');
	  commands.push({ command: SvgCommandKeys[term], values });
	}

	return commands;
  }

  #normalize(format = SvgPathFormats.COMMAND_LIST) {
	let finalPoint, penultimatePoint, normalizedCommands = [], commands = this.#extractCommands(this.path), firstPoint = commands[0].values;

	commands.forEach(({ command, values }, i) => {
	  if (i > 0) {
		const previousFinalPoint = finalPoint;
		const previousPenultimatePoint = command === SvgCommands.QUADRATIC_CURVE_TO || command === SvgCommands.SMOOTH_QUADRATIC_CURVE_TO ? penultimatePoint : null;
		finalPoint = values.slice(-2);

		penultimatePoint = command === SvgCommands.QUADRATIC_CURVE_TO
		  ? values.slice(values.length - 4, values.length - 2)
		  : command === SvgCommands.SMOOTH_QUADRATIC_CURVE_TO
			? [ 2 * previousFinalPoint[0] - previousPenultimatePoint[0], 2 * previousFinalPoint[1] - previousPenultimatePoint[1] ]
			: null;

		values = toCubicBezierConversions.get(command)(values, previousFinalPoint, previousPenultimatePoint, firstPoint);
		command = SvgCommands.CURVE_TO;
	  } else {
		finalPoint = values.slice(-2);
	  }

	  normalizedCommands.push({ command, values });
	});

	switch (format) {
	  case SvgPathFormats.PATH_STRING:
		return normalizedCommands.map(({ command, values }) => `${command.description} ${values.join(' ')}`).join(' ').trim();
	  case SvgPathFormats.CUBIC_BEZIER_CURVES:
		let m = commands.splice(0, 1)[0], previousFinal = new Point(m.values[0], m.values[1]), curves = [];

		for (let { values } of commands) {
		  curves.push(new CubicBezier(previousFinal, new Point(values[0], values[1]), new Point(values[2], values[3]), new Point(values[4], values[5])));
		  previousFinal = new Point(values[4], values[5]);
		}
			
		return curves.length > 1 ? new CompositeCubicBezier(...curves) : curves[0];
	  case SvgPathFormats.COMMAND_LIST:
	  default:
		return normalizedCommands;
	}
  }

  toCubicBezierSvgPath() {
	return this.normalizedPath;
  }

  toCubicBeziers() {
	return this.normalizedCurves;
  }

  toCubicBezierSvgCommands() {
	return this.normalizedCommands;
  }
}

export { SvgPath, svgTestString };