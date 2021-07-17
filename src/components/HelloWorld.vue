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

let canvas;
let ctx;
let url = ref('/src/assets/images/chameleon.png');
// let url = ref('/src/assets/images/small.png');

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
    };
};

const toMatrix = (arr, width, perPixel = 4) => {
    let matrix = [];
    for (let i = 0; i < arr.length; i += perPixel * width) {
        let row = [];
        for (let j = 0; j < perPixel * width; j += perPixel) {
            row.push(arr.slice(i + j, i + j + perPixel));
        }
        matrix.push(row);
    }
    return matrix;
};

const toGrayMap = (matrix) => {
    let grayMap = matrix.map((row) => row.map((pixel) => (pixel[0] + pixel[1] + pixel[2]) / 3));
    grayMap.forEach((row) => {
        row.push(row[row.length - 1]);
        row.unshift(row[0]);
    });
    grayMap.push(grayMap[grayMap.length - 1]);
    grayMap.unshift(grayMap[0]);
    return grayMap;
};

const create2DMatrix = (h, w) => {
    return [...Array(h)].map((r) => Array(w));
};

const sobel = (matrix) => {
    const grayMap = toGrayMap(matrix);
    let rows = matrix.length;
    let cols = matrix[0].length;
    let result = create2DMatrix(rows, cols);
    for (let i = 0; i < rows; ++i) {
        for (let j = 0; j < cols; ++j) {
            const sy =
                -grayMap[i][j] +
                grayMap[i + 2][j] -
                2 * grayMap[i][j + 1] +
                2 * grayMap[i + 2][j + 1] -
                grayMap[i][j + 2] +
                grayMap[i + 2][j + 2];
            
            const sx =
                -grayMap[i][j] +
                grayMap[i][j + 2] -
                2 * grayMap[i + 1][j] +
                2 * grayMap[i + 1][j + 2] -
                grayMap[i + 2][j] +
                grayMap[i + 2][j + 2];
                
            result[i][j] = Math.sqrt(sy ** 2 + sx ** 2);
        }
    }
    return result;
};

const toGrayscaleMatrix = (grayMap) => {
    let matrix = grayMap.map((row) => row.map((val) => [val, val, val, 255]));
    return matrix;
};

const toImageData = (matrix) => {
    return new Uint8ClampedArray(matrix.flat(2));
};

const something = () => {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    // console.log("dayda", imageData.data)
    let m = toMatrix(Array.from(imageData.data), canvas.width);
    // console.log('matrix', m);
    // m = m.map(row => {
    //     return row.map(pixel => {
    //         let avg = (pixel[0] + pixel[1] + pixel[2]) / 3;
    //         return [avg, avg, avg, 255];
    //     })
    // });
    let graymap = toGrayMap(m);
    // console.log("grayMap", graymap);
    // console.log("grayscale?", toGrayscaleMatrix(graymap));
    m = toGrayscaleMatrix(sobel(m));
    let newData = toImageData(m);
    // console.log("going back", imageData);
    imageData.data.set(newData);
    ctx.putImageData(imageData, 0, 0);

    // m.forEach()
};
</script>

<style scoped></style>
