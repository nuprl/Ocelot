import * as t from 'babel-types';
import * as babel from 'babel-core';
import { Visitor, NodePath } from 'babel-traverse';
// import * as Babel from '@babel/standalone';
import celotSymposium from './runtime';

const getTestFunctionId = (statements: NodePath<t.Statement>[]): t.Identifier[] => {
    let functionNameIdentifiers: t.Identifier[] = [];
    for (let statement of statements) {
        if (!t.isFunctionDeclaration(statement.node)) {
            continue;
        }
        if (statement.node.id.name.substring(0, 4) === 'test') {
            functionNameIdentifiers.push(t.identifier(statement.node.id.name));
        }
    }
    return functionNameIdentifiers;
};

const visitor: Visitor = {
  Program: {
    enter(path: NodePath<t.Program>) {
      const functionIdentifiers = getTestFunctionId(path.get('body'));
      const numStatements = path.get('body').length;
      const testCallStatement = t.expressionStatement(
        t.callExpression(
            t.memberExpression(
                t.identifier('celotSymposium'),
                t.identifier('celot')
            ),
            [t.arrayExpression(functionIdentifiers)]
          )
      );
      if (numStatements === 0) {
        path.replaceWith(t.program([testCallStatement]));
        path.stop();
        return;
      }
      path.get('body')[numStatements - 1].insertAfter(testCallStatement);
      path.stop();
    }
  },
};

function plugin() {
  return { visitor: visitor };
}

function compile(code: string): string {
  plugin();
  const result = babel.transform(code, {
    plugins: [plugin],
    ast: false,
    code: true
  });
  return result.code!;

}

export { compile, celotSymposium };