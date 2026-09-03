<script setup>
import { onMounted } from "vue";

const ws = new WebSocket("ws://localhost:5305");

function startBot() {
    ws.send("start-bot");
}
</script>

<template>
    <main>
        <div class="hero">
            <h1>PENGU</h1>
            <p>You can start using Pengu Dashboard to control your own Pengu.</p>

            <button @click="startBot">Click to send server hello!</button>
        </div>
    </main>
</template>

<style scoped>
main {
    width: 100vw;
    height: 100vh;
}

div.hero {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
}

div.hero>p {
    font-size: 1rem;
}

div.hero>h1 {
    font-size: 5.4rem;
}
</style>