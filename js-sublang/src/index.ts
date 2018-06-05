import * as t from 'babel-types';
import * as babel from 'babel-core';
import { Visitor } from 'babel-traverse';

const visitor: Visitor = {
  VariableDeclaration(path) {
    if (path.node.kind === 'var') {
      throw path.buildCodeFrameError(`Do not use var. Use let or const`);
    }
  },
  MemberExpression(path) {
    // Turn m.x into typeof m.x === 'undefined' ? throw 'bad' : m.x
    // path.replaceWith(
    //   t.conditionalExpression(
    //     t.binaryExpression('===',
    //     t.unaryExpression('typeof', path.node),
    //     t.s
  }
}

function plugin() {
  return { visitor: visitor };
}

export function compile(code: string): string {
  const result = babel.transform(code, {
    plugins: [plugin],

    ast: false,
    code: true
  });
  return result.code!;
}