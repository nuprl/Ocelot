import * as t from 'babel-types';
import * as babel from 'babel-core';
import { Visitor, NodePath } from 'babel-traverse';

const visitor: Visitor = {
  Program: {
    exit(path: NodePath<t.Program>) {
      path.get('body')[0].insertBefore(
        t.variableDeclaration(
          'var',
          [t.variableDeclarator(
            t.identifier('rts'),
            t.callExpression(
              t.identifier('require'),
              [t.stringLiteral('./elementaryjs-runtime')]
            )
          )]
        ));
      path.stop();
    }
  },
  VariableDeclaration: {
    // This could be done with linting
    enter(path: NodePath<t.VariableDeclaration>) {
      if (path.node.kind === 'var') {
        throw path.buildCodeFrameError(`Do not use var. Use let or const`);
      }
    }
  },
  MemberExpression: {
    exit(path: NodePath<t.MemberExpression>) {
      path.replaceWith(
        t.conditionalExpression(
          t.binaryExpression(
            '===',
            t.unaryExpression('typeof', t.callExpression(
              t.memberExpression(t.identifier('rts'), t.identifier('getMember')),
              //  we can't assume object is always an identifier but will do for now
              [path.node.object, 
                t.stringLiteral((path.node.property as t.Identifier).name),
              t.booleanLiteral(true)]
            )),
            t.stringLiteral('undefined')
          ),
          t.callExpression(
            t.memberExpression(t.identifier('rts'), t.identifier('raise')),
            [t.stringLiteral('BADDDD')]
          ),
          t.callExpression(
            t.memberExpression(t.identifier('rts'), t.identifier('getMember')),
            []
          )
        )
      );
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