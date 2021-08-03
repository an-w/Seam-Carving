export default class Carver {
    imageData: ImageData;
    width: number;
    height: number;
    energyMap: number[][];

    constructor(imageData: ImageData, width: number, height: number) {
        this.imageData = imageData;
        this.width = width;
        this.height = height;
        this.energyMap = this.sobel(this.toGsMatrix(imageData.data, imageData.width));
    }

    seams: number[][] = [];



    async insert(vertical: boolean = true) {
        // console.log("vertical", vertical)
        let path = this.seams.shift()!;
        let [newData, highlightData] = vertical ? this.insertVerticalPath(this.imageData.data, this.energyMap, path) : this.insertHorizontalPath(this.imageData.data, this.energyMap, path);
        let highlightImage = new ImageData(highlightData, this.imageData.width, this.imageData.height);
        this.imageData = new ImageData(newData, this.imageData.width + +vertical, this.imageData.height + +!vertical);
        return [this.imageData, highlightImage];
    }

    async carve(vertical: boolean = true) {
        let path = vertical ? this.findVerticalPath(this.energyMap) : this.findHorizontalPath(this.energyMap);
        let [newData, highlightData] = vertical
            ? this.removeVerticalPath(this.imageData.data, this.energyMap, path)
            : this.removeHorizontalPath(this.imageData.data, this.energyMap, path);
        let highlightImage = new ImageData(highlightData, this.imageData.width, this.imageData.height);
        this.imageData = new ImageData(newData, this.imageData.width - +vertical, this.imageData.height - +!vertical);

        return [this.imageData, highlightImage];
    }

    sobel(matrix: number[][]) {
        let rows = matrix.length;
        let cols = matrix[0].length;
        let result = this.create2DMatrix(rows, cols);

        // pad matrix
        matrix.forEach((row) => {
            row.push(row[row.length - 1]);
            row.unshift(row[0]);
        });
        matrix.push(matrix[matrix.length - 1]);
        matrix.unshift(matrix[0]);

        for (let i = 0; i < rows; ++i) {
            for (let j = 0; j < cols; ++j) {
                const sy =
                    -matrix[i][j] +
                    matrix[i + 2][j] -
                    2 * matrix[i][j + 1] +
                    2 * matrix[i + 2][j + 1] -
                    matrix[i][j + 2] +
                    matrix[i + 2][j + 2];

                const sx =
                    -matrix[i][j] +
                    matrix[i][j + 2] -
                    2 * matrix[i + 1][j] +
                    2 * matrix[i + 1][j + 2] -
                    matrix[i + 2][j] +
                    matrix[i + 2][j + 2];

                result[i][j] = Math.sqrt(sy ** 2 + sx ** 2);
            }
        }
        return result;
    }

    toGsMatrix(imageBuffer: Uint8ClampedArray, width: number) {
        let matrix = [];
        for (let i = 0; i < imageBuffer.length; i += 4 * width) {
            let row = [];
            for (let j = 0; j < 4 * width; j += 4) {
                let pixel = imageBuffer.slice(i + j, i + j + 4);
                row.push((pixel[0] + pixel[1] + pixel[2]) / 3);
            }
            matrix.push(row);
        }
        return matrix;
    }

    toGsBuffer = (matrix: number[][]) => {
        return new Uint8ClampedArray(matrix.map((row) => row.map((val) => [val, val, val, 255])).flat(2));
    };

    findVerticalPath(m: number[][]) {
        let cumE = this.copyMatrix(m);
        let h = m.length;
        let w = m[0].length;

        // calculate cumulative minimum energies from top to bottom
        for (let i = 1; i < h; ++i) {
            for (let j = 0; j < w; ++j) {
                let l = j !== 0 ? cumE[i - 1][j - 1] : cumE[i - 1][j];
                let r = j !== w - 1 ? cumE[i - 1][j + 1] : cumE[i - 1][j];
                cumE[i][j] += Math.min(l, cumE[i - 1][j], r);
            }
        }

        // trace minimum path from bottom to top
        let idx = cumE[h - 1].indexOf(Math.min(...cumE[h - 1]));
        let result = [idx];
        for (let i = h - 2; i >= 0; --i) {
            let l = idx !== 0 ? cumE[i][idx - 1] : Infinity;
            let r = idx !== w - 1 ? cumE[i][idx + 1] : Infinity;
            let choices = [l, cumE[i][idx], r];
            idx += choices.indexOf(Math.min(...choices)) - 1;
            result.unshift(idx);
        }

        return result;
    }

    findHorizontalPath(m: number[][]) {
        let cumE = this.copyMatrix(m);
        let h = m.length;
        let w = m[0].length;

        // calculate cumulative minimum energies from left to right
        for (let j = 1; j < w; ++j) {
            for (let i = 0; i < h; ++i) {
                let t = i !== 0 ? cumE[i - 1][j - 1] : cumE[i][j - 1];
                let b = i !== h - 1 ? cumE[i + 1][j - 1] : cumE[i][j - 1];
                cumE[i][j] += Math.min(t, cumE[i][j - 1], b);
            }
        }

        // trace minimum path from right to left
        let lastCol = cumE.map((r) => r[w - 1]);
        let idx = lastCol.indexOf(Math.min(...lastCol));
        let result = [idx];
        for (let j = w - 2; j >= 0; --j) {
            let t = idx !== 0 ? cumE[idx - 1][j] : Infinity;
            let b = idx !== h - 1 ? cumE[idx + 1][j] : Infinity;
            let choices = [t, cumE[idx][j], b];
            idx += choices.indexOf(Math.min(...choices)) - 1;
            result.unshift(idx);
        }

        return result;
    }


    async initVerticalInsertion(n: number) {
        let newMap = this.copyMatrix(this.energyMap);
        let idxMap = [...Array(newMap.length)].map((r) => [...Array(newMap[0].length + n)].map((_, i) => i));
        for (let i = 0; i < n; ++i) {
            let path = this.findVerticalPath(newMap);
            this.seams.push(path.map((c, idx) => idxMap[idx][c]));
            for (let i = 0; i < path.length; ++i) {
                newMap[i].splice(path[i], 1);
                idxMap[i].splice(path[i], 2);
            }
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    async initHorizontalInsertion(n: number) {
        let newMap = this.copyMatrix(this.energyMap);
        let idxMap = [...Array(newMap.length + 2 * n)].map((r, i) => [...Array(newMap[0].length)].map(() => i));
        for (let i = 0; i < n; ++i) {
            let path = this.findHorizontalPath(newMap);
            this.seams.push(path.map((r, idx) => idxMap[r][idx]));
            for (let c = 0; c < path.length; ++c) {
                for (let r = path[c]; r < newMap.length - 1; ++r) {
                    newMap[r][c] = newMap[r + 1][c];
                }
                for (let r = path[c]; r < idxMap.length - 2; ++r) {
                    idxMap[r][c] = idxMap[r + 2][c];
                }
            }
            newMap.pop();
            idxMap.pop();
            idxMap.pop();
            await new Promise((resolve) => setTimeout(resolve, 0));
        }
    }

    removeVerticalPath(imageBuffer: Uint8ClampedArray, m: number[][], path: number[]) {
        let newData = new Uint8ClampedArray(imageBuffer.length - path.length * 4);
        let highlightData = new Uint8ClampedArray(imageBuffer.length);
        highlightData.set(imageBuffer);
        let bufferWidth = m[0].length * 4;
        let newBufferWidth = bufferWidth - 4;
        for (let i = 0; i < path.length; ++i) {
            // splice energy matrix
            m[i].splice(path[i], 1);

            // copy image buffer
            let before = imageBuffer.slice(i * bufferWidth, i * bufferWidth + path[i] * 4);
            let after = imageBuffer.slice(i * bufferWidth + path[i] * 4 + 4, (i + 1) * bufferWidth);
            newData.set(before, i * newBufferWidth);
            newData.set(after, i * newBufferWidth + path[i] * 4);

            // colour red
            let p = i * bufferWidth + path[i] * 4 + 4;
            highlightData[p] = 255;
            highlightData[p + 1] = 0;
            highlightData[p + 2] = 0;
            highlightData[p + 3] = 255;
        }
        return [newData, highlightData];
    }

    insertVerticalPath(imageBuffer: Uint8ClampedArray, m: number[][], path: number[]) {
        let newData = new Uint8ClampedArray(imageBuffer.length + path.length * 4);
        let highlightData = new Uint8ClampedArray(imageBuffer.length);
        highlightData.set(imageBuffer);
        let bufferWidth = m[0].length * 4;
        let newBufferWidth = bufferWidth + 4;
        for (let i = 0; i < path.length; ++i) {
            // splice energy matrix
            m[i].splice(path[i], 0, path[i]);

            // copy image buffer
            let before = imageBuffer.slice(i * bufferWidth, i * bufferWidth + path[i] * 4);
            let after = imageBuffer.slice(i * bufferWidth + path[i] * 4 - 4, (i + 1) * bufferWidth + 4);
            newData.set(before, i * newBufferWidth);
            newData.set(after, i * newBufferWidth + path[i] * 4);

            // colour red
            let p = i * bufferWidth + path[i] * 4 + 4;
            highlightData[p] = 255;
            highlightData[p + 1] = 0;
            highlightData[p + 2] = 0;
            highlightData[p + 3] = 255;
        }
        return [newData, highlightData];
    }

    insertHorizontalPath(imageBuffer: Uint8ClampedArray, m: number[][], path: number[]) {
        let newData = new Uint8ClampedArray(imageBuffer.length + path.length * 4);
        newData.set(imageBuffer.subarray(0, imageBuffer.length));
        let highlightData = new Uint8ClampedArray(imageBuffer.length);
        highlightData.set(imageBuffer);

        let bufferWidth = m[0].length * 4;
        let newHeight = m.length + 1;
        m.push(m[m.length - 1]);
        for (let i = 0; i < path.length; ++i) {
            for (let r = newHeight - 1; r > path[i]; --r) {
                m[r][i] = m[r - 1][i];

                newData[r * bufferWidth + i * 4] = imageBuffer[r * bufferWidth + i * 4 - bufferWidth];
                newData[r * bufferWidth + i * 4 + 1] = imageBuffer[r * bufferWidth + i * 4 - bufferWidth + 1];
                newData[r * bufferWidth + i * 4 + 2] = imageBuffer[r * bufferWidth + i * 4 - bufferWidth + 2];
                newData[r * bufferWidth + i * 4 + 3] = imageBuffer[r * bufferWidth + i * 4 - bufferWidth + 3];
            }

            highlightData[path[i] * bufferWidth + i * 4] = 255;
            highlightData[path[i] * bufferWidth + i * 4 + 1] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 2] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 3] = 255;
        }

        return [newData, highlightData];
    }

    removeHorizontalPath(imageBuffer: Uint8ClampedArray, m: number[][], path: number[]) {
        let newData = new Uint8ClampedArray(imageBuffer.length - path.length * 4);
        newData.set(imageBuffer.subarray(0, imageBuffer.length - path.length * 4));
        let highlightData = new Uint8ClampedArray(imageBuffer.length);
        highlightData.set(imageBuffer);

        let bufferWidth = m[0].length * 4;
        let newHeight = m.length - 1;
        for (let i = 0; i < path.length; ++i) {
            for (let r = path[i]; r < newHeight; ++r) {
                m[r][i] = m[r + 1][i];

                newData[r * bufferWidth + i * 4] = imageBuffer[r * bufferWidth + i * 4 + bufferWidth];
                newData[r * bufferWidth + i * 4 + 1] = imageBuffer[r * bufferWidth + i * 4 + bufferWidth + 1];
                newData[r * bufferWidth + i * 4 + 2] = imageBuffer[r * bufferWidth + i * 4 + bufferWidth + 2];
                newData[r * bufferWidth + i * 4 + 3] = imageBuffer[r * bufferWidth + i * 4 + bufferWidth + 3];
            }

            highlightData[path[i] * bufferWidth + i * 4] = 255;
            highlightData[path[i] * bufferWidth + i * 4 + 1] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 2] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 3] = 255;
        }
        m.pop();
        return [newData, highlightData];
    }

    copyMatrix(m: number[][]) {
        return m.map((r) => [...r]);
    }

    create2DMatrix(h: number, w: number) {
        return [...Array(h)].map((r) => Array(w));
    }
}
