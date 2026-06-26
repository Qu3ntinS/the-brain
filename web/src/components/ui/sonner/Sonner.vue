<script lang="ts" setup>
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
  XIcon,
} from '@lucide/vue'
import type { ToasterProps } from 'vue-sonner'
import { Toaster as Sonner } from 'vue-sonner'
import { cn } from '@/lib/utils'

const props = withDefaults(defineProps<ToasterProps>(), {
	theme: 'dark',
	position: 'top-right',
	richColors: true,
	closeButton: true,
})
</script>

<template>
  <Sonner
    :class="cn('brain-sonner toaster group pointer-events-auto', props.class)"
    v-bind="props"
  >
    <template #success-icon>
      <CircleCheckIcon class="size-4 text-brain-teal" />
    </template>
    <template #info-icon>
      <InfoIcon class="size-4 text-brain-pink" />
    </template>
    <template #warning-icon>
      <TriangleAlertIcon class="size-4 text-brain-gold" />
    </template>
    <template #error-icon>
      <OctagonXIcon class="size-4 text-destructive" />
    </template>
    <template #loading-icon>
      <Loader2Icon class="size-4 animate-spin text-brain-teal" />
    </template>
    <template #close-icon>
      <XIcon class="size-4" />
    </template>
  </Sonner>
</template>
