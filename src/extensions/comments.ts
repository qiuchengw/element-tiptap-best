// @ts-nocheck

// 参考：https://github.com/radans/tiptap-comments
//
// import { Mark, MenuData, mergeAttributes } from 'tiptap';
import { Mark, MenuData } from 'tiptap';
import { v4 as uuidv4 } from "uuid";
// import {findIndex} from 'lodash'
import CommentPopover from '@/components/MenuCommands/CommentPopover.vue';
import { CommandFunction } from 'tiptap-commands';
import { MenuBtnView } from '@/../types';
import applyMark from '@/utils/apply_mark';

export interface CommentInterface {
    user: any,
    uuid: string | null,
    comment: string,
    date: number | null,
    parent_id: string | null
    parent_title: string | null
}

export interface Comment {
    comment: string,
    parent_id: string | null
}

export interface CustomCommentInterface {
    threadId: string | null,
    comments: CommentInterface[] | null
}

interface CommentsStorageInterface {
    comments: CustomCommentInterface[],
    comment_id: string | null
}

export interface CommentOptionsInterface {
    user: {}
}

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
    get name() {
        return 'comments';
    }

    get defaultOptions() {
        return {
            highlightColor: '#ff0000',
            // 当前用户
            user: ''
        };
    }

    get schema() {
        return {
            attrs: {
                highlightColor: '#ff0000',
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
                    console.log("=========> get attr:", ret);
                    return ret;
                },
            }],
            toDOM(node) {
                let ret = ['span', { 
                    'style': `background-color:${node.attrs.highlightColor}`,
                    'comment_id': node.attrs.comment_id
                }, 0];
                // console.log("=======> the node:", node, ret);
                return ret;
            },
        };
    }

    // 添加commands，这个是tiptap调用的
    // 可以返回一个函数，或者返回一个对象
    // 返回函数的时候，那么命令的名字就是extension的名字
    // 返回对象的时候，那么命令的名字就是对象的key
    commands() {
        return {
            setComment: (comment): CommandFunction =>
                (state, dispatch) => {
                    console.log("===> the comment:", this.storage);
                    // 添加评论
                    // let comment_id = this.addComments(comment);
                    let comment_id = "8888";
                    // 设置颜色
                    const { schema } = state;
                    let { tr } = state;
                    const markType = schema.marks.comments;
                    console.log("===> the mark:", schema);
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
        let { commands, getMarkAttrs, t } = menuData;
        // console.log("===> the comm:", this.options, menuData);
        return {
            component: CommentPopover,
            componentProps: {
                colorSet: this.options?.colors,
                tooltip: "hello",
                icon: 'tint',
            },
            componentEvents: {
                confirm: (value: string) => {
                    console.log("====> hello value:", value, menuData);
                    commands.setComment({
                        comment: value,
                    });
                },
            },
        };
    }

    addOptions() {
        return {
            user: {}
        }
    }

    addStorage() {
        console.log("===>add Storage");
        return {
            comments: [],
            comment_id: null
        }
    }

    // EditorCommandSet
    addComments(comment: CommentInterface) {
        let commentsList: CustomCommentInterface;
        const finalComment: CommentInterface = {
            uuid: uuidv4(),
            user: this.options.user,
            comment: comment.comment,
            date: Date.now(),
            parent_title: null,
            parent_id: null
        };

        // let threadId = "";
        if (comment.parent_id) {
            const index = findIndex(this.storage.comments, { threadId: this.storage.comment_id });
            const commentIndex = findIndex(this.storage.comments[index].comments ?? [], { uuid: comment.parent_id });
            const parent = this.storage.comments[index];
            if (parent && parent.comments) {
                finalComment.parent_id = parent.comments[commentIndex].uuid;
                finalComment.parent_title = parent.comments[commentIndex].comment.substring(0, 50);
            }
            this.storage.comments[index].comments?.push(finalComment)
        } else {
            commentsList = {
                threadId: uuidv4(),
                comments: []
            };
            commentsList.comments?.push(finalComment);
            // commands.setMark('comment', { 'comment_id': commentsList.threadId })
            this.storage.comments.push(commentsList);
        }
    }

    // @ts-ignore
    // removeSpecificComment: (threadId: string, commentId: string) => ({commands}) => {
    //     let comments = this.storage?.comments;
    //     const index = findIndex(comments, {threadId: threadId})
    //     if (comments[index].comments) {

    //         const commentIndex = findIndex(comments[index].comments ?? [], {uuid: commentId})
    //         comments[index].comments?.splice(commentIndex, 1)

    //         if (!comments[index].comments?.length) {
    //             comments.splice(index, 1);
    //         }

    //         this.storage.comments = comments;
    //         this.editor.state.doc.descendants((node: any, pos: any) => {
    //             const {marks} = node
    //             marks.forEach((mark: any) => {
    //                     if (mark.type.name === 'comment') {
    //                         const comment_id = mark.attrs.comment_id;
    //                         if (!this.storage.comments.filter(obj => obj.threadId === comment_id).length) {

    //                             this.editor.commands.setTextSelection({
    //                                 from: pos,
    //                                 to: pos + (node.text?.length || 0),
    //                             })
    //                             this.editor.commands.unsetMark('comment');
    //                         }
    //                     }
    //                 }
    //             )

    //         });
    //     }
    //     return true;
    // }

    // @ts-ignore
    onSelectionUpdate({ editor }) {
        if (!editor.isActive('comment')) {
            this.storage.comment_id = null;
        } else {
            this.storage.comment_id = editor.getAttributes('comment').comment_id;
        }
    }
    onUpdate() {

    }
};
