---
title: The Ocelot JavaScript Programming Environment
---

![Image of Ocelot](./ocelot-robot-screenshot.jpg)

Ocelot is a web-based IDE that we use to teach an [introductory software
engineering course at University of Massachusetts Amherst](https://umass-compsci220.github.io) The IDE has
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

For some sample demos of the features of Ocelot, you could run a demo [animated
robot path planner (RRT)](https://code.ocelot-ide.org/?gist=joydeep-b/1f40f8584709404c07f1da24d025a194)
or a [bouncing ball
animation](https://code.ocelot-ide.org/?gist=joydeep-b/8956ab7ab21e36a0f4c12fa289f952a4).
