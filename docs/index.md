---
title: The Ocelot JavaScript Programming Environment
---

![Image of Ocelot](./ocelot-robot-screenshot.jpg)

Ocelot is a web-based IDE that we use to teach an introductory software
engineering course at University of Massachusetts Amherst.[^1] The IDE has
the following features:

1. It saves files continuously and maintains a fine-grained history of edits.
2. It integrates support for testing, graphics, and other helpful libraries.
3. It compiles and runs code entirely in the browser.
4. It has a REPL.

Therefore, Ocelot works with a flaky Internet connection, works on any
device that has a web browser, and limits the risk of students losing their
work.

A key feature of Ocelot is that it is a **pedagogical IDE** -- the
[rationale]({{
site.baseurl }}{% link rationale.md %}) page describes the specific language-level features
that Ocelot supports towards this goal, and the rationale behind them.