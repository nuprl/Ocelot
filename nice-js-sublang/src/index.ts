import * as t from 'babel-types';
import * as babel from 'babel-core';
import { Visitor, NodePath } from 'babel-traverse';

const visitor: Visitor = {
  Program: {
    exit(path) {
      path.get('body.0').insertBefore(
        t.variableDeclaration(
          'var',
          [t.variableDeclarator(
            t.identifier('rts'),
            t.callExpression(
              t.identifier('require'),
              [t.stringLiteral('./nice-js-runtime')]
            )
          )]
        )
      );
      path.stop();
    }
  },
  VariableDeclaration: {
    enter(path) {
      if ((<NodePath<t.VariableDeclaration>>path).node.kind === 'var') {
        throw path.buildCodeFrameError(`Do not use var. Use let or const`);
      }
    }
  },
  MemberExpression: {
    // Turn m.x into typeof m.x === 'undefined' ? rts.raise('badd') : m.x
    exit(path: NodePath<t.MemberExpression>) {
      path.replaceWith(
        t.conditionalExpression(
          t.binaryExpression(
            '===',
            t.unaryExpression('typeof', path.node),
            t.stringLiteral('undefined')),
          t.callExpression(
            t.memberExpression(t.identifier('rts'), t.identifier('raise')),
            [t.stringLiteral('BADDDD')]
          ),
          path.node
        )
      )
      path.skip();
    }
  },
  WithStatement: {
    enter(path: NodePath<t.WithStatement>) {
      throw path.buildCodeFrameError(`Do not use with.`);
    }
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