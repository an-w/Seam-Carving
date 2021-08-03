<template>
    <div class="flex border border-gray-300 items-center p-5 bg-gray-100 rounded-lg">
        <div class="flex flex-col items-center">
            <div class="flex items-center w-60 mb-2 justify-end">
                <span class="">Width</span>
                <el-input
                    @focus="$event.target.select()"
                    class="w-32 mx-10 mr-7 ml-3"
                    v-model.number="inputWidth"
                    type="number"
                >
                    <template #append>{{ unitText }}</template>
                </el-input>
            </div>
            <div class="flex items-center w-60 mb-2 justify-end">
                <span class="">Height</span>
                <el-input
                    @focus="$event.target.select()"
                    class="w-32 mx-10 mr-7 ml-3"
                    v-model.number="inputHeight"
                    type="number"
                >
                    <template #append>{{ unitText }}</template>
                </el-input>
            </div>
            <div class="flex items-center">
                <span class="w-3" :class="{ 'font-bold text-lg': !pixels }">%</span>
                <el-switch
                    class="text-white mx-3"
                    v-model="pixels"
                    inactive-color="#2563eb"
                    active-color="#1e40af"
                    @change="updateFormUnits"
                ></el-switch>
                <span class="w-3" :class="{ 'font-bold text-lg': pixels }">px</span>
            </div>
        </div>
        
        <div class="flex flex-col h-full">
            <label
                class="
                    w-28
                    py-1
                    border
                    bg-white
                    border-gray-300
                    rounded-md
                    shadow-lg
                    hover:border-gray-500
                    cursor-pointer
                    mx-2
                    flex
                    pl-3
                    mb-1
                "
                ><svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#222222">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                </svg>
                <span class="ml-2">Upload</span>
                <input type="file" accept="image/*" class="hidden" @change="emit('change', $event)" />
            </label>
            <button
                class="w-28 py-1 text-black border bg-white rounded-md border-gray-300 hover:border-gray-500 shadow-lg mx-2 flex pl-3"
                @click="emit('save', $event)"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    enable-background="new 0 0 24 24"
                    height="24px"
                    viewBox="0 0 24 24"
                    width="24px"
                    fill="#222222"
                >
                    <g><rect fill="none" height="24" width="24" /></g>
                    <g><path d="M5,20h14v-2H5V20z M19,9h-4V3H9v6H5l7,7L19,9z" /></g>
                </svg>
                <span class="ml-2">Save</span>
            </button>
            <button
                class="w-28 py-1 text-white bg-blue-600 rounded-md shadow-lg hover:bg-blue-800 mx-2 flex pl-3 mt-auto"
                @click="submit"
            >
                <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#ffffff">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path
                        d="M19 12h-2v3h-3v2h5v-5zM7 9h3V7H5v5h2V9zm14-6H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16.01H3V4.99h18v14.02z"
                    />
                </svg><span class="ml-2">Resize</span>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, defineProps, toRefs, watch, defineEmits, unref } from 'vue';

const props = defineProps({ height: Number, width: Number });
const emit = defineEmits(['submit', 'change', 'save']);
const { height, width } = toRefs(props);

let inputWidth = ref(0);
let inputHeight = ref(0);

let pixels = ref(true);
let unitText = computed(() => (pixels.value ? 'px' : '%'));

watch(
    [height, width],
    (values) => {
        pixels.value = true;
        inputHeight.value = unref(values[0])!;
        inputWidth.value = unref(values[1])!;
    },
    { immediate: true }
);

const updateFormUnits = () => {
    inputWidth.value = pixels.value ? unref(width)! : 100;
    inputHeight.value = pixels.value ? unref(height)! : 100;
};

const submit = () => {
    let h = Math.floor(pixels.value ? inputHeight.value : (inputHeight.value / 100) * unref(height)!);
    let w = Math.floor(pixels.value ? inputWidth.value : (inputWidth.value / 100) * unref(width)!);
    emit('submit', { inputHeight: h, inputWidth: w });
};
</script>

<style scoped></style>
