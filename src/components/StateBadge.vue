<template>
  <span class="state-badge" :class="cssClass">
    {{ displayLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const props = withDefaults(defineProps<{
  state: string;
  label?: string;
}>(), {});

const stateKeyMap: Record<string, string> = {
  finished: "finished",
  "under construction": "underConstruction",
  planned: "planned",
};

const cssClass = computed(() => props.state.replace(" ", "-"));

const displayLabel = computed(() => {
  if (props.label) return props.label;
  const key = stateKeyMap[props.state];
  if (key) return t(`project.state.${key}`);
  return props.state;
});
</script>

<style scoped lang="postcss">
.state-badge {
  @apply inline-flex items-center rounded-full text-label-sm font-medium whitespace-nowrap;
  padding: calc(var(--spacing-unit) * 0.5) calc(var(--spacing-unit));
}

.state-badge.finished {
  @apply bg-finished text-white;
}

.state-badge.under-construction {
  @apply bg-underConstruction text-black;
}

.state-badge.planned {
  @apply bg-planned text-white;
}
</style>
