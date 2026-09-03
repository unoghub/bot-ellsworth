<script setup>
import { RouterView } from "vue-router";
import { store } from "./store";
import { onBeforeMount } from "vue";

function handleData(data) {
    if (data && data != 401) {
        store.authenticated = true;
        store.user = data;
    }
}

onBeforeMount(() => {
    fetch("/api/user")
        .then(res => res.json())
        .then(handleData)
        .catch(err => console.error(err));
});
</script>

<template>
    <RouterView />
</template>