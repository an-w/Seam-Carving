<template>
    <div class="h-full" direction="vertical">
        <div class="text-5xl mb-10 font-bold"> Seam Carving </div>
        <div class="text-center ">
            <div class="flex justify-center">
                <size-input :height="height" :width="width" @submit="onSizeSubmit"  @change="onFileChange"></size-input>
            </div>
            <canvas class="img-canvas mt-5 mx-auto max-w-full max-h-96" style="max-height: 60vh;"></canvas>
        </div>
    </div>
</template>

<script setup lang="ts">
import SizeInput from './SizeInput.vue';
import { computed, ref, onMounted } from 'vue';
import Carver from '../carver/carver';
import defaultImg from '/src/assets/images/chameleon.png';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let carver: Carver;
let url = ref('');

let width = ref(0);
let height = ref(0);

let fileList = ref([]);

onMounted(() => {
    canvas = document.querySelector('.img-canvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    loadNew(defaultImg);
});

const onFileChange = (event: Event) => {
    console.log("file changed", event);
    let reader = new FileReader();
    reader.readAsDataURL((event.target as HTMLInputElement).files![0]);
    reader.onload = e => {
        if (e.target!.readyState === FileReader.DONE) {
            loadNew(e.target!.result as string);
        }
    }
}

const carve = async (px = 100, vertical = true) => {
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
};

const onSizeSubmit = async ({ inputHeight, inputWidth }: { inputHeight: number; inputWidth: number }) => {
    console.log('size just changed', inputHeight, inputWidth);
    await carve(width.value - inputWidth, true);
    await carve(height.value - inputHeight, false);
    width.value = canvas.width;
    height.value = canvas.height;
};
</script>

<style scoped></style>
