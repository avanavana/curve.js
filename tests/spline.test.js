import { isValidBSplineArgs, isNotValidBSplineArgs } from '../validation.js';
import { collectArgs } from '../utils.js';

import { Point } from '../point.js';

describe('Arguments of new BSpline() constructor:', () => {
  const p1 = new Point(1, 2),
        p2 = new Point(2, 3),
        p3 = new Point(3, 4),
        p4 = new Point(4, 5),
        p5 = new Point(5, 6),
        p6 = new Point(6, 7);
  
  test('A single argument of type "Point[]" (length > 4) should be valid as a constructor argument for class "BSpline" (isValidBSplineArgs should return true and isNotValidBSplineArgs should return false).', () => {
    expect(collectArgs(isValidBSplineArgs, [ p1, p2, p3, p4, p5, p6 ])).toBe(true);
    expect(collectArgs(isNotValidBSplineArgs, [ p1, p2, p3, p4, p5, p6 ])).toBe(false);
  });
});

