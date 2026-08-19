<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import TechOrbit from './components/TechOrbit.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #home-hero-image>
      <TechOrbit />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* TechOrbit 气泡轨道需要溢出可见（配合 #home-hero-image 插槽替换默认 Hero 图片） */
.VPHero .image,
.VPHero .image-container {
  overflow: visible;
}

.VPSwitchAppearance {
  width: 22px !important;
}

.VPSwitchAppearance .check {
  transform: none !important;
}
</style>
