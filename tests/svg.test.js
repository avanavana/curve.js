import { isValidSvgPathArgs, isNotValidSvgPathArgs } from '../validation.js';

describe('Arguments of new SvgPath() constructor:', () => {
  const svgLinePath = 'M 0 0 L 1 1';
  const svgCubicBezierPath = 'M 0 0 C 0 1 4 1 4 0';
  const svgInvalidCubicBezierPath = 'M 0 0 C 0 1 4 1 4 0';
  const svgQuadraticBezierPath = 'M 0 0 Q 2 4 4 0';
  const svgSmoothCubicBezierPath = 'M 0 0 C 0 1 4 1 4 0 S 8 -1 8 0';
  const svgSmoothQuadraticBezierPath = 'M 0 0 Q 2 4 4 0 T 8 0';
  const svgSquarePath = 'M 0 0 V 1 H 1 V 0 Z';
  const svgCirclePath = 'M -0.5 0 A 0.5 0.5 0 1 1 -0.5 0.0001 Z';
  
  test('A single argument of type "string" consisting only of valid SVG commands should be valid as a constructor argument for class "SvgPath" (isValidSvgPathArgs should return true and isNotValidSvgPathArgs should return false).', () => {
    expect(isValidSvgPathArgs(svgLinePath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgLinePath)).toBe(false);
    expect(isValidSvgPathArgs(svgCubicBezierPath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgCubicBezierPath)).toBe(false);
    expect(isValidSvgPathArgs(svgSmoothCubicBezierPath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgSmoothCubicBezierPath)).toBe(false);
    expect(isValidSvgPathArgs(svgQuadraticBezierPath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgQuadraticBezierPath)).toBe(false);
    expect(isValidSvgPathArgs(svgSmoothQuadraticBezierPath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgSmoothQuadraticBezierPath)).toBe(false);
    expect(isValidSvgPathArgs(svgSquarePath)).toBe(true);
    expect(isNotValidSvgPathArgs(svgSquarePath)).toBe(false);
  });

  test('The presence of the "A" (elliptical arc to) SVG command should render an SVG path argument invalid as a constructor argument for class "SvgPath" (isValidSvgPathArgs should return false and isNotValidSvgPathArgs should return true).', () => {
    expect(isValidSvgPathArgs(svgCirclePath)).toBe(false);
    expect(isNotValidSvgPathArgs(svgCirclePath)).toBe(true);
  });
});
