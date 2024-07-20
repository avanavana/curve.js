import { Point } from './point.js';

function distance(a, b) {
  const dx = b.x - a.x,
    dy = b.y - a.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function mid(a, b) {
  return new Point((a.x + b.x) / 2, (a.y + b.y) / 2);
}

function lerp(a, b, t = 0.5) {
  return new Point((1 - t) * a.x + t * b.x, (1 - t) * a.y + t * b.y);
}

function collectArgs(f, ...input) {
  const args = input.length > 1 ? [ ...input ] : Array.isArray(input) ? input.flat() : input;
  return f(args);
}

function array1DTo2D(a) {
  let b = [];
  while (a.length) b.push(test.splice(0, 4));
  return b;
}

function cleanDecimal(d, precision = 9) {
  return Math.round(d * Math.pow(10, precision)) / Math.pow(10, precision);
}

function createSplineCoefficientMatrix(n) {
  let cols = [], fourIndex = 0;

  for (let i = 0; i < n; i++) {
    let row = [];

    for (let j = 0; j < n; j++) {
      if (j === fourIndex) row.push(4);  
      else if (Math.abs(fourIndex - j) === 1) row.push(1);
      else row.push(0);
    }

    cols.push(row);
    fourIndex++;
  }

  return cols;
}

function multiplyMatrices(m1, m2) {
  const product = [];
  
  for (let i = 0; i < m1.length; i++) {
    product[i] = [];
    
    for (let j = 0; j < m2[0].length; j++) {
      let sum = 0;  
      for (let k = 0; k < m1[0].length; k++) sum += m1[i][k] * m2[k][j];
      product[i][j] = sum;
    }
  }
  
  return product;
}

function invertMatrix(A, { cleanDecimals } = { cleanDecimals: true }) {
  if (A[0].length !== A.length) throw new Error('Not a square matrix.');
  const n = A.length, I = [];

  for (let i = 0; i < n; i++) {
    I.push(Array(n).fill(0));
    I[i][i] = 1;
  }

  for (let i = 0; i < n; i++) {
    let max = i;
    for (let k = i + 1; k < n; k++) if (Math.abs(A[k][i]) > Math.abs(A[max][i])) max = k;

    [ A[i], A[max] ] = [ A[max], A[i] ];
    [ I[i], I[max] ] = [ I[max], I[i] ];

    const det = A[i][i];
    if (det === 0) throw 'Matrix is singular and cannot be inverted.';

    for (let j = 0; j < n; j++) {
      A[i][j] /= det;
      I[i][j] /= det;
    }

    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
                
        for (let j = 0; j < n; j++) {
          A[k][j] -= factor * A[i][j];
          I[k][j] -= factor * I[i][j];
        }
      }
    }
  }

  return cleanDecimals ? I.map((row) => row.map((col) => cleanDecimal(col))) : I;
}

export {
  distance,
  mid,
  lerp,
  collectArgs,
  createSplineCoefficientMatrix,
  multiplyMatrices,
  invertMatrix,
  cleanDecimal,
  array1DTo2D
 };
