declare module 'tiptap-commands' {
  import { EditorView } from 'prosemirror-view';
  import { EditorState, Transaction } from 'prosemirror-state';

  interface DispatchFunction {
    (tr: Transaction): boolean;
  }

  interface CommandFunction {
    (state: EditorState, dispatch: DispatchFunction | undefined, view: EditorView): any;
  }

  interface Command {
    (...params: any[]): any;
  }
}
