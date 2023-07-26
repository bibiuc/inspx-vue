<template>
  <div>
    <div class="inspx" :class="{ inspecting: enabled }" :style="inspxStyle">
      <div class="relative h-full w-full">
        <div v-for="(box, i) in boxes" :key="i" class="flex flex-items-center justify-center" :class="'inspx-' + box.type" :style="{ left: box.x + 'px', top: box.y + 'px', width: box.w + 'px', height: box.h + 'px' }">
          <div class="size">{{ box.size }}</div>
        </div>
      </div>
    </div>
    <slot></slot>
  </div>
</template>
<script laang="ts" setup>
import { useMagicKeys } from '@vueuse/core';
import { useElementRects, useMouseElement } from './composable';
import { computed, unref } from 'vue';
const props = defineProps({
  margin: {
    type: Boolean,
    default: true,
  },
  padding: {
    type: Boolean,
    default: true,
  },
  size: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
const { alt } = useMagicKeys();
const target = useMouseElement(alt);
const { boxes, size } = useElementRects(target);
const enabled = computed(() => unref(alt) && !props.disabled && unref(boxes) && unref(boxes).length);
const inspxStyle = computed(() => {
  const { left, top, width, height, paddingTop, paddingRight, paddingBottom, paddingLeft, borderTop, borderRight, borderBottom, borderLeft, marginTop, marginRight, marginBottom, marginLeft } = unref(size);
  if (unref(enabled)) {
    return {
      top: top + 'px',
      left: left + 'px',
      width: width + paddingRight + paddingLeft + borderRight + borderLeft + marginRight + marginLeft + 'px',
      height: height + paddingTop + paddingBottom + borderTop + borderBottom + marginTop + marginBottom + 'px',
    };
  }
  return;
});
</script>
<style lang="less" scoped>
@inspx-margin-color: #f24822;
@inspx-padding-color: #0bb658;
@inspx-border-color: #fff100;
@inspx-size-color: #0070f3;
@inspx-active-color: #0070f330;
@inspx-font-bg-color: #000;
.inspx {
  display: none;
  overflow: visible;
}
.inspecting.inspx {
  box-sizing: border-box;
  display: block;
  height: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  font-size: 11px;
  line-height: 20px;
  text-align: center;
  border-radius: 0px;
  color: white;
  padding: 0 0px;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1337;
  pointer-events: none;
  background-color: fade(@inspx-active-color, 40%) !important;

  .inspx-size,
  .inspx-padding,
  .inspx-border,
  .inspx-margin {
    position: absolute;
    background-color: fade(@inspx-active-color, 40%);
    display: flex;
    align-items: center;
    justify-content: center;
    .size {
      background-color: fade(@inspx-active-color, 40%);
      color: #fff;
      padding: 3px 5px;
      border-radius: 3px 3px;
    }
  }
  .inspx-size {
    background-color: fade(@inspx-size-color, 40%);
    .size {
      background-color: saturate(@inspx-size-color, 50%);
      z-index: 1;
    }
  }
  .inspx-padding {
    background-color: fade(@inspx-padding-color, 40%);
    .size {
      background-color: saturate(@inspx-padding-color, 50%);
      z-index: 2;
    }
  }
  .inspx-border {
    background-color: fade(@inspx-border-color, 40%);
    .size {
      background-color: saturate(@inspx-border-color, 50%);
      z-index: 3;
    }
  }
  .inspx-margin {
    background-color: fade(@inspx-margin-color, 40%);
    .size {
      background-color: saturate(@inspx-margin-color, 50%);
      z-index: 4;
    }
  }
}
</style>