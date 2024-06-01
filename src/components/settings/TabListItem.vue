<script>
export default {
  props: ["tab", "activeTab", "name"],

  computed: {
    tabClass() {
      return "tab-" + this.tab + " " + (this.tab === this.activeTab ? "active" : "")
    }
  }
} 
</script>

<template>
  <li :class="tabClass">{{ name }}</li>
</template>

<style scoped>
li {
  padding: 9px 20px;
  font-size: 13px;
  user-select: none;
  cursor: pointer;
}

li:hover {
  background: #f1f1f1;
}

html.dark li:hover {
  background: #292929;
}

li.active {
  background: #487eb5;
  color: #fff;
  cursor: default;
}

html.dark li.active {
  background: #487eb5;
}
</style>
