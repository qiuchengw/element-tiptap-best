<template>
  <div class="el-tiptap-editor__wrapper">
    <el-tiptap
      :extensions="textExtensions"
      content="Text ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText ExtensionsText Extensions"
      :userProps="extraProps"
    />

    <el-tiptap
      :extensions="paragraphExtensions"
      content="Paragraph Extensions"
    />

    <el-tiptap
      :extensions="richAndToolsExtensions"
      content="Rich And Tools Extensions"
    />
  </div>
</template>

<script>
import {
  Doc,
  Text,
  Paragraph,
  // text extensions
  Bold,
  Underline,
  Italic,
  Strike,
  Code,
  FontType,
  FontSize,
  TextColor,
  TextHighlight,
  FormatClear,
  // paragraph extensions
  Heading,
  ListItem,
  BulletList,
  OrderedList,
  TodoItem,
  TodoList,
  TextAlign,
  LineHeight,
  Indent,
  Blockquote,
  CodeBlock,
  // rich and tools extensions
  Link,
  Image,
  Table,
  TableHeader,
  TableCell,
  TableRow,
  Iframe,
  TrailingNode,
  HorizontalRule,
  Fullscreen,
  Print,
  Preview,
  SelectAll,
  History,
  CodeView,
  Comments,
} from 'element-tiptap';

import codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css'; // import base style
import 'codemirror/mode/xml/xml.js'; // language
import 'codemirror/addon/selection/active-line.js'; // require active-line.js
import 'codemirror/addon/edit/closetag.js'; // autoCloseTags

let cnt = 1;
export default {
  data() {
    return {
      extraProps: {
        comments: {
          onAddComment: (comment, quote) => {
            console.log('====onAddComment:', comment, quote);
            cnt++;
            console.log('===> fuck cnt:', cnt);
            return `${cnt}`;
          },
          onSelectComment: (comment_id) => {
            console.log('====onSelectComment:', comment_id);
          },
        },
      },
      textExtensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Bold({ bubble: true }),
        new Underline({ bubble: true }),
        new Italic({ bubble: true }),
        new Strike({ bubble: true }),
        new Code(),
        new FontType(),
        new FontSize(),
        new TextColor({ bubble: true }),
        new TextHighlight({ bubble: true }),
        new FormatClear(),
        new History(),
        new Comments({ bubble: true }),
      ],
      paragraphExtensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Heading({ level: 5 }),
        new ListItem(),
        new BulletList(),
        new OrderedList(),
        new TodoItem(),
        new TodoList(),
        new TextAlign(),
        new LineHeight(),
        new Indent(),
        new Blockquote(),
        new CodeBlock(),
        new History(),
      ],
      richAndToolsExtensions: [
        new Doc(),
        new Text(),
        new Paragraph(),
        new Link(),
        new Image(),
        new Iframe(),
        new Table({ resizable: true }),
        new TableHeader(),
        new TableCell(),
        new TableRow(),
        new HorizontalRule(),
        new Print(),
        new Preview(),
        new SelectAll(),
        new Fullscreen(),
        new CodeView({
          codemirror,
          codemirrorOptions: {
            styleActiveLine: true,
            autoCloseTags: true,
          },
        }),
        new TrailingNode(),
        new History(),
      ],
    };
  },

  methods: {
    handleComment(editor) {
      console.log('====editor comment:', editor);
    },

    onTransactionEvent(event) {
      console.log('🔥transaction', event);
    },
  },
};
</script>
