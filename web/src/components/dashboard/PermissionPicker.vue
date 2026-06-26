<script setup lang="ts">
import { computed } from 'vue'
import type { Permission } from '@/composables/useAccess'
import { Checkbox } from '@/components/ui/checkbox'
import {
	Field,
	FieldDescription,
	FieldLegend,
	FieldSet,
} from '@/components/ui/field'
import { Label } from '@/components/ui/label'

const props = defineProps<{
	permissions: Permission[]
	modelValue: string[]
	disabled?: boolean
}>()

const emit = defineEmits<{
	'update:modelValue': [value: string[]]
}>()

const grouped = computed(() => {
	const groups = new Map<string, Permission[]>()

	for (const permission of props.permissions) {
		const category = permission.category ?? 'other'
		const list = groups.get(category) ?? []
		list.push(permission)
		groups.set(category, list)
	}

	return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
})

function isChecked(slug: string) {
	return props.modelValue.includes(slug)
}

function toggle(slug: string, checked: boolean) {
	const next = new Set(props.modelValue)

	if (checked) next.add(slug)
	else next.delete(slug)

	emit('update:modelValue', [...next])
}
</script>

<template>
	<FieldSet>
		<FieldLegend>Permissions</FieldLegend>
		<FieldDescription>
			Select which features this role can access.
		</FieldDescription>

		<div class="flex flex-col gap-6">
			<FieldSet v-for="[category, items] in grouped" :key="category">
				<FieldLegend class="capitalize">{{ category }}</FieldLegend>
				<div class="flex flex-col gap-3">
					<Field
						v-for="permission in items"
						:key="permission.slug"
						orientation="horizontal"
					>
						<Checkbox
							:id="`permission-${permission.slug}`"
							:model-value="isChecked(permission.slug)"
							:disabled="disabled"
							@update:model-value="toggle(permission.slug, $event === true)"
						/>
						<div class="flex flex-col gap-0.5">
							<Label :for="`permission-${permission.slug}`">
								{{ permission.name }}
							</Label>
							<span
								v-if="permission.description"
								class="text-xs text-muted-foreground"
							>
								{{ permission.description }}
							</span>
							<span class="font-mono text-[11px] text-muted-foreground">
								{{ permission.slug }}
							</span>
						</div>
					</Field>
				</div>
			</FieldSet>
		</div>
	</FieldSet>
</template>
