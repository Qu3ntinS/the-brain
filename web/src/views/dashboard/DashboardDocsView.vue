<script setup lang="ts">
import { ApiReference } from '@scalar/api-reference'
import '@scalar/api-reference/style.css'
import { onMounted, onUnmounted, useTemplateRef } from 'vue'
import { brainScalarConfig } from '@/lib/scalar-config'

const root = useTemplateRef('root')
let resizeObserver: ResizeObserver | undefined

const syncHeight = (height: number) => {
	if (!root.value || height <= 0) return
	root.value.style.setProperty('--brain-scalar-height', `${Math.round(height)}px`)
}

onMounted(() => {
	if (!root.value) return

	syncHeight(root.value.clientHeight)

	resizeObserver = new ResizeObserver(([entry]) => {
		syncHeight(entry.contentRect.height)
	})
	resizeObserver.observe(root.value)
})

onUnmounted(() => resizeObserver?.disconnect())
</script>

<template>
	<div ref="root" class="brain-scalar-docs brain-scalar-embedded">
		<ApiReference
			class="brain-scalar-embedded-root"
			:configuration="brainScalarConfig"
		/>
	</div>
</template>

<style scoped>
.brain-scalar-docs {
	--brain-scalar-height: 100%;
	--full-height: var(--brain-scalar-height);
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
	height: 100%;
	overflow: hidden;
}

/* ApiReference root wrapper (style tag + layout) */
.brain-scalar-docs :deep(> div) {
	display: flex;
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
	overflow: hidden;
}

.brain-scalar-docs :deep(.brain-scalar-embedded-root) {
	flex: 1 1 auto;
	min-height: 0;
}

.brain-scalar-docs :deep(.references-rendered) {
	min-height: 0 !important;
	overflow-y: auto !important;
}
</style>
