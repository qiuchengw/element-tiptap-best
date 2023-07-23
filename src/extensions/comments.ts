// @ts-nocheck

// 参考：https://github.com/radans/tiptap-comments
//
import { Mark, MenuData } from 'tiptap';
import { Plugin, TextSelection } from 'prosemirror-state';
import { getMarkRange, getMarkAttrs } from 'tiptap-utils';
import { CommandFunction } from 'tiptap-commands';
import { MenuBtnView } from '@/../types';
import applyMark from '@/utils/apply_mark';
import CommentPopover from '@/components/MenuCommands/CommentPopover.vue';

declare module 'tiptap' {
    interface Commands<ReturnType> {
        comment: {
            /**
             * Set a comment mark
             */
            setComment: (comment: string) => ReturnType,
            /**
             * Toggle a comment mark
             */
            toggleComment: () => ReturnType,
            /**
             * Unset a comment mark
             */
            unsetComment: () => ReturnType,
        }
    }
}

export default class Comments extends Mark implements MenuBtnView {
    private emitFunc: Function = null;
    private commentsProps: Object = null;
    get name() {
        return 'comments';
    }

    get defaultOptions() {
        return {
            highlightColor: '#ffeb3beb',
        };
    }

    get schema() {
        return {
            attrs: {
                highlightColor: '#ffeb3beb',
                comment_id: '',
            },
            inline: true,
            group: 'inline',

            parseDOM: [{
                tag: 'span[comment_id]',
                getAttrs: (dom: HTMLElement) => {
                    const { backgroundColor } = dom.style;
                    let ret = {
                        highlightColor: backgroundColor,
                        comment_id: dom.getAttribute('comment_id')
                    };
                    // console.log("=========> get attr:", ret);
                    return ret;
                },
            }],
            toDOM(node) {
                let ret = ['span', {
                    // 设置样式
                    // ;
                    'style': `background-color:${node.attrs.highlightColor};border-bottom:3px double gray`,
                    'comment_id': node.attrs.comment_id,
                }, 0];
                // console.log("=======> the node:", node, ret);
                return ret;
            },
        };
    }

    get plugins() {
        let that = this;
        return [
            new Plugin({
                props: {
                    handleClick(view: EditorView, pos: number) {
                        const { schema, doc, tr } = view.state;
                        const range = getMarkRange(doc.resolve(pos), schema.marks.comments);
                        if (!range) {
                            return false;
                        }

                        const $start = doc.resolve(range.from);
                        const $end = doc.resolve(range.to);
                        const transaction = tr.setSelection(new TextSelection($start, $end));
                        // 重要，获取当前的mark的属性
                        let attrs = getMarkAttrs(view.state, schema.marks.comments)
                        let comment_id = attrs.comment_id;
                        // console.log("===> select:", that.commentsProps, comment_id);
                        // 提交消息到外面的组件上
                        if (that.commentsProps?.onSelectComment && comment_id) {
                            that.commentsProps.onSelectComment(comment_id);
                        }

                        // view.dispatch(transaction);
                        return true;
                    },
                },
            }),
        ];
    }

    // 添加commands，这个是tiptap调用的
    // 可以返回一个函数，或者返回一个对象
    // 返回函数的时候，那么命令的名字就是extension的名字
    // 返回对象的时候，那么命令的名字就是对象的key
    commands() {
        return {
            setComment: (comment, quoteText): CommandFunction =>
                (state, dispatch) => {
                    // 添加评论
                    // console.log("===> the comment:", this.commentsProps);
                    let comment_id = null;
                    if (this.commentsProps?.onAddComment) {
                        comment_id = this.commentsProps.onAddComment(comment, quoteText);
                    }
                    if (!comment_id) {
                        return;
                    }

                    // 设置颜色
                    const { schema } = state;
                    let { tr } = state;
                    const markType = schema.marks.comments;
                    // console.log("===> the mark:", schema);
                    const attrs = {
                        comment_id: comment_id,
                        highlightColor: this.options.highlightColor
                    };
                    tr = applyMark(
                        state.tr.setSelection(state.selection),
                        markType,
                        attrs
                    );
                    if (tr.docChanged || tr.storedMarksSet) {
                        dispatch && dispatch(tr);
                        return true;
                    }
                },
            toggleComment: () => ({ commands }) => commands.toggleMark('comment'),
            unsetComment: () => ({ commands }) => commands.unsetMark('comment'),
        };
    }

    menuBtnView(menuData: MenuData) {
        let { commands, editor, getMarkAttrs, t } = menuData;
        // console.log("===> the comm:", menuData);
        if (!this.emitFunc) {
            this.emitFunc = editor?.emit;
        }
        if (!this.commentsProps) {
            this.commentsProps = editor?.userProps?.comments;
            // console.log("====> comment prosp:", this.commentsProps);
        }
        return {
            component: CommentPopover,
            componentProps: {
                // colorSet: this.options?.colors,
                tooltip: "hello",
                icon: 'tint',
            },
            componentEvents: {
                confirm: (value: string) => {
                    // console.log("====> hello value:", value, menuData);
                    commands.setComment({
                        comment: value,
                    });
                },
            },
        };
    }
};
