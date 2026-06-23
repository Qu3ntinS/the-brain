<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { initSynapseCanvas } from '@shared/synapse-canvas'

const canvasRef = ref<HTMLCanvasElement | null>(null)
let cleanup: (() => void) | undefined

onMounted(() => {
	const canvas = canvasRef.value
	if (!canvas) return

	cleanup = initSynapseCanvas(canvas)
})

onUnmounted(() => cleanup?.())
</script>

<template>
	<canvas
		ref="canvasRef"
		class="pointer-events-none fixed inset-0 z-[1] opacity-70 motion-reduce:hidden"
		aria-hidden="true"
	/>
</template>
