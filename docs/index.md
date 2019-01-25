---
title: The Ocelot JavaScript Programming Environment
---

Ocelot is a web-based IDE that we use to teach an introductory software
engineering course at University of Massachusetts Amherst ([COMPSCI 220
Programming Methodology]). Ocelot has the following features:

1. It saves files continuously and maintains a fine-grained history of edits.
   We use Google Cloud Platform for the backend.
2. It integrates support for testing, graphics, and other helpful libraries.
3. It compiles and runs code entirely in the browser. Therefore, it works with
   a flaky Internet connection.
4. It features a web-based REPL.

The most significant feature of Ocelot is the programming language that it
provides to students. Ocelot supports a restricted subset of JavaScript that we
call ElementaryJS[^1]. JavaScript is a powerful, but complicated language with
several poorly-designed features that can confuse even expert programmers.[^2]
This makes JavaScript a poor choice for teaching beginners how to code.
ElementaryJS uses a combination of static and dynamic checks to eliminate
JavaScript's most egregious features:

1. ElementaryJS has arity-mismatch errors.
        ```javascript
        function F(x) { return x; }
        F(1, 2)
        // Produces an error:
        // function F expected 1 argument but received 2 arguments at Line 1: in F
        // ... Line 5
        ```
2. In ElementaryJS, trying to read a non-existent field raises an error instead of
   producing `undefined`:
        ```javascript
        function F(x) { return x; }
        F(1, 2)
        // Produces an error:
        // object does not have member 'y' at Line 2
3. In ElementaryJS, a program cannot dynamically add or remove fields from
   an object.
        ```javascript
        let obj = { x: 100 };
        obj.y = 10;
        ```
4. ElementaryJS requires block scoping and disallows the `var` keyword.

3. In ElementaryJS,


[^1]: ElementaryJS is a [language-level] for JavaScript, inspired by the
language-levels of DrRacket.

[^2]: Gary Bernhardt's [Wat] talk illustrates several questionable features of
JavaScript (and other languages). The examples in the talk do not work in
ElementaryJS.


[COMPSCI 220]: https://umass-compsci220.github.io
[language-level]: https://docs.racket-lang.org/drracket/htdp-langs.html
[Wat]: https://www.destroyallsoftware.com/talks/wat