<template>
  <el-popover
    v-model="popoverVisible"
    :disabled="et.isCodeViewMode"
    placement="bottom"
    trigger="click"
    popper-class="el-tiptap-popper"
  >
    <div class="color-hex">
      <el-input
        type="textarea"
        autosize
        placeholder="CTRL+Enter 确定"
        autofocus="true"
        maxlength="100"
        v-model="commentVal"
        show-word-limit
        @keydown.native="handleKeyCode($event)"
      >
      </el-input>

      <el-button type="text" size="small" @click="confirmComment(commentVal)">
        {{ confirmText }}
      </el-button>
    </div>
    <command-button
      slot="reference"
      :enable-tooltip="et.tooltip"
      :tooltip="tooltip"
      :icon="icon"
      :readonly="et.isCodeViewMode"
    />
  </el-popover>
</template>

<script lang="ts">
import {
  Component,
  Prop,
  Watch,
  Emit,
  Vue,
  Inject,
} from 'vue-property-decorator';
import { Button, Popover, Input } from 'element-ui';
import CommandButton from './CommandButton.vue';

@Component({
  components: {
    [Button.name]: Button,
    [Popover.name]: Popover,
    [Input.name]: Input,
    CommandButton,
  },
})
export default class CommentPopover extends Vue {
  @Prop({
    type: String,
    required: true,
  })
  readonly tooltip!: string;

  @Prop({
    type: String,
    required: true,
  })
  readonly icon!: string;

  @Prop({
    type: String,
    default: '确定',
  })
  readonly confirmText!: string; // TODO: i18n ?

  private popoverVisible: boolean = false;
  private commentVal: string = '';

  @Inject() readonly et!: any;

  // @Watch('selectedColor', {
  //   immediate: true,
  // })
  // onSelectedColorChange(color: string): void {
  //   this.color = color;
  // }

  @Emit('confirm')
  confirmComment(val: string): string {
    this.popoverVisible = false;

    return val;
  }

  handleKeyCode(e: any) {
    if (e.ctrlKey && e.keyCode == 13) {
      //用户点击了ctrl+enter触发
      e.preventDefault(); //阻止默认事件
      console.log('====> the ctrl+enter keydown');
      this.confirmComment(this.commentVal);
    } else {
      //用户点击了enter触发
      console.log('====> the enter keydown');
    }
  }
}
</script>
