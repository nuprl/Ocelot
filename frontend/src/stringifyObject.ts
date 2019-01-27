// stringify-objects forked from Yeoman Github repo, with modifications.
// 
// Copyright (c) 2015, Yeoman team
// All rights reserved.

// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:

// 1. Redistributions of source code must retain the above copyright notice, this
//    list of conditions and the following disclaimer.
// 2. Redistributions in binary form must reproduce the above copyright notice,
//    this list of conditions and the following disclaimer in the documentation
//    and/or other materials provided with the distribution.

// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
// ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
// DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
// ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
// (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
// LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
// ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
// (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
// SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

'use strict';
const isRegexp = require('is-regexp');
const isObj = require('is-obj');
const getOwnEnumPropSymbols = require('get-own-enumerable-property-symbols').default;

module.exports = (val: any, opts: any, pad: any) => {
  const seen: any[] = [];

  return (function stringify(val: any, opts: any, pad: any): string {
    opts = opts || {};
    opts.indent = opts.indent || '\t';
    pad = pad || '';

    let tokens: any;

    if (opts.inlineCharacterLimit === undefined) {
      tokens = {
        newLine: '\n',
        newLineOrSpace: '\n',
        pad,
        indent: pad + opts.indent
      };
    } else {
      tokens = {
        newLine: '@@__STRINGIFY_OBJECT_NEW_LINE__@@',
        newLineOrSpace: '@@__STRINGIFY_OBJECT_NEW_LINE_OR_SPACE__@@',
        pad: '@@__STRINGIFY_OBJECT_PAD__@@',
        indent: '@@__STRINGIFY_OBJECT_INDENT__@@'
      };
    }

    const expandWhiteSpace = (stringVal: string) => {
      if (opts.inlineCharacterLimit === undefined) {
        return stringVal;
      }

      const oneLined = stringVal
        .replace(new RegExp(tokens.newLine, 'g'), '')
        .replace(new RegExp(tokens.newLineOrSpace, 'g'), ' ')
        .replace(new RegExp(tokens.pad + '|' + tokens.indent, 'g'), '');

      if (oneLined.length <= opts.inlineCharacterLimit) {
        return oneLined;
      }

      return stringVal
        .replace(new RegExp(tokens.newLine + '|' + tokens.newLineOrSpace, 'g'), '\n')
        .replace(new RegExp(tokens.pad, 'g'), pad)
        .replace(new RegExp(tokens.indent, 'g'), pad + opts.indent);
    };

    if (seen.indexOf(val) !== -1) {
      return '[Circular]';
    }

    if (typeof val === 'function') {
      return '[function]';
    }
    if (val === null ||
      val === undefined ||
      typeof val === 'number' ||
      typeof val === 'boolean' ||
      typeof val === 'symbol' ||
      isRegexp(val)) {
      return String(val);
    }

    if (val instanceof Date) {
      return `new Date('${val.toISOString()}')`;
    }

    if (Array.isArray(val)) {
      if (val.length === 0) {
        return '[]';
      }

      seen.push(val);

      let stringArray: string[] = [];
      for (let i = 0; i < val.length; i++) {
        const eol = val.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
        let value = stringify(val[i], opts, pad + opts.indent);
        if (opts.transform) {
          value = opts.transform(val, i, value);
        }
        stringArray.push(tokens.indent + value + eol);
      }

      const ret = '[' + tokens.newLine + stringArray.join('') + tokens.pad + ']';

      seen.pop();

      return expandWhiteSpace(ret);
    }

    if (isObj(val)) {
      let objKeys = Object.keys(val).concat(getOwnEnumPropSymbols(val));

      if (opts.filter) {
        objKeys = objKeys.filter(el => opts.filter(val, el));
      }

      if (objKeys.length === 0) {
        return '{}';
      }

      seen.push(val);

      const ret = '{' + tokens.newLine + objKeys.map((el, i) => {
        const eol = objKeys.length - 1 === i ? tokens.newLine : ',' + tokens.newLineOrSpace;
        const isSymbol = typeof el === 'symbol';
        const isClassic = !isSymbol && /^[a-z$_][a-z$_0-9]*$/i.test(el);
        const key = isSymbol || isClassic ? el : stringify(el, opts, undefined);
        let value = stringify(val[el], opts, pad + opts.indent);
        if (opts.transform) {
          value = opts.transform(val, el, value);
        }
        return tokens.indent + String(key) + ': ' + value + eol;
      }).join('') + tokens.pad + '}';

      seen.pop();

      return expandWhiteSpace(ret);
    }

    val = String(val).replace(/[\r\n]/g, x => x === '\n' ? '\\n' : '\\r');

    if (opts.singleQuotes === false) {
      val = val.replace(/"/g, '\\"');
      return `"${val}"`;
    }

    val = val.replace(/\\?'/g, '\\\'');
    return `'${val}'`;
  })(val, opts, pad);
};
