<template>
    <el-container class="h-full" direction="vertical">
        <el-header class="bg-purple-100"> Seam Carving </el-header>
        <el-main class="bg-red-100 text-center">
            <div class="bg-blue-100 flex">
                <size-input :height="height" :width="width" @submit="onSizeSubmit"></size-input>

                <el-input class="w-80" plaholder="Url" v-model="url"></el-input>
                <el-button @click="loadNew">load</el-button>
                <el-button @click="something()">do something</el-button>
            </div>
            <canvas class="img-canvas m-auto max-w-full max-h-full"></canvas>
        </el-main>
        <el-footer class="bg-green-100"> feet </el-footer>
    </el-container>
</template>

<script setup lang="ts">


import SizeInput from './SizeInput.vue';
import { computed, ref, onMounted } from 'vue';
import Carver from '../carver/carver';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let carver: Carver;
let url = ref('');

let width = ref(0);
let height = ref(0);

onMounted(() => {
    canvas = document.querySelector('.img-canvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    loadNew('/src/assets/images/chameleon.png');
});

const something = async (px = 100, vertical = true) => {
    for (let i = 0; i < px; ++i) {
        const [imageData, hightlightData] = await carver.carve(vertical);
        ctx.putImageData(hightlightData, 0, 0);
        await new Promise((resolve) => setTimeout(resolve, 0));
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
    }
};


const loadNew = (url: string) => {
    const img = new Image();
    img.src = url;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        width.value = img.width;
        height.value = img.height;
        ctx.drawImage(img, 0, 0);
        img.style.display = 'none';
        carver = new Carver(ctx.getImageData(0, 0, canvas.width, canvas.height), canvas.width, canvas.height);
    };
}

const onSizeSubmit = async ({ inputHeight, inputWidth }: { inputHeight: number; inputWidth: number }) => {
    console.log('size just changed', inputHeight, inputWidth);
    await something(width.value - inputWidth, true);
    await something(height.value - inputHeight, false);
    width.value = canvas.width;
    height.value = canvas.height;
};



</script>

<style scoped></style>
