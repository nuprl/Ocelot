import { AsyncRun } from 'stopify';
import * as consoleFeed from 'console-feed/lib/definitions/Console';

export type EditorState = {
  runner: AsyncRun | undefined
}

export type Message = consoleFeed.Message | 
  { method: 'command' | 'result' | 'error', data: any };

export type HasConsole = {
  error(...message: any[]): void;
  log(...message: any[]): void;
  command(command: string, result: any, isError: boolean): void;
}

export type HasRunner = {
  getRunner: () => AsyncRun | undefined,
  setRunner: (runner: AsyncRun) => void,
  clearRunner: () => void
}