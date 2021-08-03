<template>
    <div class="h-full" direction="vertical" >
        <div class="text-4xl mb-5 mt-5 font-bold"> Seam Carving </div>
        <div class="text-center">
            <div class="flex justify-center">
                <size-input :height="height" :width="width" @submit="onSizeSubmit"  @change="onFileChange" @save="downloadImage"></size-input>
            </div>
            <canvas class="img-canvas mt-5 mx-auto" style=""></canvas>
            <!-- <div>100 x 100</div> -->
        </div>
    </div>
</template>

<script setup lang="ts">
import SizeInput from './SizeInput.vue';
import { computed, ref, onMounted } from 'vue';
import Carver from '../carver/carver';
import defaultImg from '/src/assets/images/dali.png';
import FileSaver from 'file-saver';

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let carver: Carver;
let imgSrc = ref('');

let width = ref(0);
let height = ref(0);

let fileList = ref([]);

onMounted(() => {
    canvas = document.querySelector('.img-canvas') as HTMLCanvasElement;
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    loadNew(defaultImg);
});

const downloadImage = () => {
    const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
    FileSaver.saveAs(
        canvas.toDataURL("image/png"),
        `resized-${imgSrc.value.split(/[/\\]/).pop()}`
    );
}

const onFileChange = (event: Event) => {
    let file = (event.target as HTMLInputElement).files![0];
    imgSrc.value = file.name;
    let reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = e => {
        if (e.target!.readyState === FileReader.DONE) {
            loadNew(e.target!.result as string);
        }
    }
}

const insert = async (px = 100, vertical = true) => {
    if (vertical) {
        carver.initVerticalInsertion(px);
    } else {
        carver.initHorizontalInsertion(px);
    }
    for (let i = 0; i < px; ++i) {
        const [imageData, hightlightData] = await carver.insert(vertical);
        ctx.putImageData(hightlightData, 0, 0);
        await new Promise((resolve) => setTimeout(resolve, 30));
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        ctx.putImageData(imageData, 0, 0);
    }
};

const carve = async (px = 100, vertical = true) => {
    for (let i = 0; i < Math.abs(px); ++i) {
        const [imageData, hightlightData] = await carver.carve(vertical);
        ctx.putImageData(hightlightData, 0, 0);
        await new Promise((resolve) => setTimeout(resolve, 30));
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
    if (inputWidth > width.value) {
        await insert(inputWidth - width.value, true);
    } else {
        await carve(width.value - inputWidth, true)
    }
    if (inputHeight > height.value) {
        await insert(inputHeight - height.value, false);
    } else {
        await carve(height.value - inputHeight, false)
    }
    width.value = canvas.width;
    height.value = canvas.height;
};
</script>

<style scoped>
.img-canvas {
    max-height: calc(100vh - 400px);
    min-height: 600px;
    max-width: 80vw;
}
</style>
