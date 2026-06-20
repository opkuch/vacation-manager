<script setup lang="ts" generic="T extends { id: string }">
interface Column {
  key: string
  label: string
  class?: string
}

defineProps<{
  columns: Column[]
  rows: T[]
  loading?: boolean
  emptyText?: string
}>()

defineSlots<{
  cell(props: { row: T; column: Column }): unknown
}>()
</script>

<template>
  <div class="overflow-x-auto rounded-lg border border-border">
    <table class="w-full border-collapse text-left text-sm">
      <thead class="bg-surface-muted text-muted">
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            class="whitespace-nowrap px-4 py-2 font-medium"
            :class="column.class"
          >
            {{ column.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-muted">Loading…</td>
        </tr>
        <tr v-else-if="rows.length === 0">
          <td :colspan="columns.length" class="px-4 py-6 text-center text-muted">
            {{ emptyText ?? 'No records found.' }}
          </td>
        </tr>
        <tr
          v-for="row in rows"
          v-else
          :key="row.id"
          class="border-t border-border bg-surface text-text"
        >
          <td v-for="column in columns" :key="column.key" class="px-4 py-3" :class="column.class">
            <slot name="cell" :row="row" :column="column" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
