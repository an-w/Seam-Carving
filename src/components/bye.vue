<template>
    <h1>{{ msg }}</h1>

    <p>
        <a href="https://vitejs.dev/guide/features.html" target="_blank"> Vite Documentation </a>
        |
        <a href="https://v3.vuejs.org/" target="_blank">Vue 3 Documentation</a>
    </p>

    <button type="button" @click="state.count++">count is: {{ state.count }}</button>
    <p>
        Edit
    </p>
    <el-button class="">yo what</el-button>
</template>

<script setup>
import { defineProps, reactive } from 'vue';

defineProps({
    msg: String,
});

const state = reactive({ count: 0 });
</script>

<style scoped>
a {
    color: #42b983;
}
</style>
