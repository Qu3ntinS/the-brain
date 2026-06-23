<script setup lang="ts">
import BrainErrorCard from '@/components/BrainErrorCard.vue'
import { brainErrorDefaults } from '@shared/brain-error'
</script>

<template>
	<BrainErrorCard
		:status="404"
		:message="brainErrorDefaults.messages.notFound"
	/>
</template>
