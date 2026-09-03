<script setup>
const props = defineProps(["target"]);
</script>

<template>
    <a :href="props.target">
        <slot></slot>
    </a>
</template>

<style scoped>
a {
    text-decoration: none;
    color: var(--primary);
}
</style>