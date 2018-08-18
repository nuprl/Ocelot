import * as elementaryJS from 'elementary-js';

// Worker.ts
const ctx: Worker = self as any;

// Respond to message from parent thread
ctx.addEventListener('message', (event) => {
  const { code } = event.data;
  const compiled = elementaryJS.compile(code, true);
  const codeArray = code.split('\n');
  let markers = [];
  if (compiled.kind !== 'error') {
    ctx.postMessage({ markers: [] });
    return;
  }
  for (const err of compiled.errors) {
    markers.push({
      severity: 8,
      message: err.message,
      startLineNumber: err.line,
      endLineNumber: err.line,
      startColumn: 0, 
      endColumn: (codeArray[err.line - 1] || '').length
    });
  }
  ctx.postMessage({ markers });
});