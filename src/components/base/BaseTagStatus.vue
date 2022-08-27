<template>
  <div class="tag-status d-f" :class="type">
    <div class="dot" :class="dot"></div>
    <h1 class="tag-status__content mg-l-9 font-14">{{ this.content }}</h1>
  </div>
</template>

<script>
export default {
  name: "BaseTagStatus",
  props: {
    type: {
      type: String,
    },
    dot: {
      type: String,
    },
    content: {
      type: String,
    },
  },
};
</script>

<style scoped>
.tag-status {
  height: 30px;
  padding-right: 14px;
  align-items: center;
  border-radius: 25px;
}

.tag-status.on {
  background-color: var(--tag-bg);
}

.tag-status.off {
  background-color: transparent;
}

.tag-status .dot {
  background: var(--tag-color);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-status .dot.show {
  display: block;
}

.tag-status .dot.hide {
  display: none;
}

.tag-status__content {
  color: var(--tag-color);
}
</style>