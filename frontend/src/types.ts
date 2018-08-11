import * as consoleFeed from 'console-feed/lib/definitions/Console';

export type Message = consoleFeed.Message | 
  { method: 'command' | 'result' | 'error', data: any };

export type HasConsole = {
  error(...message: any[]): void;
  log(...message: any[]): void;
  // Echo a user command back to the console, i.e, with a carat to indicate
  // that it was input.
  echo(command: string): void;
  command(command: string, result: any, isError: boolean): void;
}
