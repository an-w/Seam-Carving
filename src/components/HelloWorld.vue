<template>
    <el-container class="h-full" direction="vertical">
        <el-header class="bg-purple-100"> Seam Carving </el-header>
        <el-header class="bg-purple-100">
            <el-input class="w-80" plaholder="Url" v-model="url"></el-input>
            <el-button @click="loadNew">load</el-button>
            <el-button @click="something">do something</el-button>
        </el-header>
        <el-main class="bg-red-100 text-center">
            <canvas class="img-canvas m-auto"></canvas>
        </el-main>
        <el-footer class="bg-green-100"> feet </el-footer>
    </el-container>
</template>

<script setup>
import { defineProps, ref, onMounted } from 'vue';
import Carver from '@/carver/carver';

let canvas;
let ctx;
let carver;
let url = ref('/src/assets/images/chameleon.png');

onMounted(() => {
    canvas = document.querySelector('.img-canvas');
    ctx = canvas.getContext('2d');
});

const loadNew = () => {
    let img = new Image();
    img.src = url.value;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        img.style.display = 'none';

        carver = new Carver(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
    };
};

const something = () => {
    let i = 0;
    let interval = setInterval(() => {
        const [imageData, hightlightData] = carver.carveVertical();
        canvas.width = hightlightData.width;
        canvas.height = hightlightData.height;
        ctx.putImageData(hightlightData, 0, 0);
        setTimeout(() => {
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            ctx.putImageData(imageData, 0, 0);
        }, 150);
        if (++i === 100) clearInterval(interval);
    }, 200);
};
</script>

<style scoped></style>
