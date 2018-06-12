import * as t from 'babel-types';
import * as babel from 'babel-core';
import { Visitor, NodePath} from 'babel-traverse';

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
              [t.stringLiteral('nice-js-runtime')]
            )
          )]
        )
      );
      path.stop(); // why is this line neceesary? When we 'exit' the program
      // should it just finish but for some reason VariableDeclaration gets run afterwards which
      // is weird.
    }
  },
  VariableDeclaration: {
    enter(path) {
      if ((<NodePath<t.VariableDeclaration>>path).node.kind === 'var') {
        throw path.buildCodeFrameError(`Do not use var. Use let or const`);
      }
    }
    
  },
  MemberExpression(path) {
    // Turn m.x into typeof m.x === 'undefined' ? throw 'bad' : m.x
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