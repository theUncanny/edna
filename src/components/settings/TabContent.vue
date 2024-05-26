<script>
export default {
  props: ["tab", "activeTab"],

  computed: {
    className() {
      return "tab-content tab-" + this.tab + " " + (this.tab === this.activeTab ? "active" : "")
    }
  }
}
</script>

<template>
  <div :class="className">
    <slot></slot>
  </div>
</template>

<style scoped>
.tab-content {
  display: none;
}

.tab-content.active {
  display: block;
}
</style>
