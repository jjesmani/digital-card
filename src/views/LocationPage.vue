<template>
  <div class="bg-[#FFF4E2] min-h-screen flex items-center justify-center">
    <transition name="fade">
      <h1 v-if="isPage3TransitionFinished" class="text-4xl text-center">
        Location Screen
      </h1>
    </transition>
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  isPage3TransitionFinished: {
    type: Boolean,
    required: true,
  },
});
</script>

<style scoped>
/* Add any page-specific styles here */
</style>
