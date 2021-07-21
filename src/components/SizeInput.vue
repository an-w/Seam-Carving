<template>
    <el-form :model="sizeForm">
        <el-form-item label="Width" label-width="auto">
            <el-input class="w-40 mx-10" v-model.number="sizeForm.width" type="number">
                <template #append>{{ unitText }}</template>
            </el-input>
        </el-form-item>
        <el-form-item label="Height" label-width="auto">
            <el-input class="w-40 mx-10" v-model.number="sizeForm.height" type="number">
                <template #append>{{ unitText }}</template>
            </el-input>
        </el-form-item>
        <el-switch
            v-model="pixels"
            active-text="px"
            inactive-text="%"
            inactive-color="#409EFF"
            @change="updateFormUnits"
        ></el-switch>
        <el-button @click="submit">Submit</el-button>
    </el-form>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, defineProps, toRefs, watch, defineEmits, unref } from 'vue';

const props = defineProps({ height: Number, width: Number });
const emit = defineEmits(['submit']);
const { height, width } = toRefs(props);

let sizeForm = ref({
    width: 0,
    height: 0,
});

let pixels = ref(true);
let unitText = computed(() => (pixels.value ? 'px' : '%'));

watch([height, width], (values) => {
    // console.log("changed", values[0], values[1])
    pixels.value = true;
    sizeForm.value.height = unref(values[0])!;
    sizeForm.value.width = unref(values[1])!;
}),
    { immediate: true };

const updateFormUnits = () => {
    sizeForm.value = pixels.value ? { height: unref(height)!, width: unref(width)! } : { height: 100, width: 100 };
};

const submit = () => {
    let h = Math.floor(pixels.value ? sizeForm.value.height : (sizeForm.value.height / 100) * unref(height)!);
    let w = Math.floor(pixels.value ? sizeForm.value.width : (sizeForm.value.width / 100) * unref(width)!);
    emit('submit', { inputHeight: h, inputWidth: w });
};
</script>

<style scoped></style>
