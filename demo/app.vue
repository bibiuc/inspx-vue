<script setup lang="ts">
import inspx from '../index.vue'
const version = 2 + 1
</script>

<template>
  <inspx>
    <div class="hello">
      Hello Nuxt {{ version }}!
    </div>
  </inspx>
</template>

<style scoped>
.hello {
  font-family: Arial, Helvetica, sans-serif;
  font-size: 3rem;
  padding: 2rem;
}
</style>
