<template>
    <el-container class="h-full" direction="vertical">
        <el-header class="bg-purple-100"> Seam Carving </el-header>
        <el-main class="bg-red-100 text-center">
            <div class="bg-blue-100 flex">
                <el-form :model="sizeForm">
                    <el-form-item label="Width" label-width="auto">
                        <el-input class="w-40 mx-10" v-model="sizeForm.width" type="number">
                            <template #append>{{ unitText }}</template>
                        </el-input>
                    </el-form-item>
                    <el-form-item label="Height" label-width="auto">
                        <el-input class="w-40 mx-10" v-model="sizeForm.height" type="number">
                            <template #append>{{ unitText }}</template>
                        </el-input>
                    </el-form-item>
                    <el-switch v-model="pixels" active-text="px" inactive-text="%" inactive-color="#409EFF"></el-switch>
                </el-form>

                <el-input class="w-80" plaholder="Url" v-model="url"></el-input>
                <el-button @click="loadNew">load</el-button>
                <el-button @click="something">do something</el-button>
            </div>
            <canvas class="img-canvas m-auto max-w-full max-h-full"></canvas>
        </el-main>
        <el-footer class="bg-green-100"> feet </el-footer>
    </el-container>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import Carver from '@/carver/carver';

let canvas;
let ctx;
let carver;
let url = ref('');
let pixels = ref(true);

let unitText = computed(() => (pixels.value ? 'px' : '%'));
let widthInput = ref(0);
let heightInput = ref(0);

let sizeForm = ref({
    width: 0,
    height: 0,
});

onMounted(() => {
    canvas = document.querySelector('.img-canvas');
    ctx = canvas.getContext('2d');
    loadNew('/src/assets/images/chameleon.png');
});

const loadNew = (url) => {
    let img = new Image();
    img.src = url;
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
        }, 50);
        if (++i === 100) clearInterval(interval);
    }, 100);
};
</script>

<style scoped></style>
