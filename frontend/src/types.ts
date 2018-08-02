import { AsyncRun } from 'stopify';

export type EditorState = {
  runner: AsyncRun | undefined
}

export type HasRunner = {
  getRunner: () => AsyncRun | undefined,
  setRunner: (runner: AsyncRun) => void,
  clearRunner: () => void
}