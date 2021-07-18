export default class Carver {
    constructor(imageData, width, height) {
        this.imageData = imageData;
        this.width = width;
        this.height = height;
        this.gsMatrix = this.sobel(this.toGsMatrix(imageData.data, imageData.width));
    }

    carveHorizontal() {
        let path = this.findHorizontalPath(this.gsMatrix);
        let [newData, highlightData] = this.removeHorizontalPath(this.imageData.data, this.gsMatrix, path);
        let highlightImage = new ImageData(highlightData, this.imageData.width, this.imageData.height);
        this.imageData = new ImageData(newData, this.imageData.width, this.imageData.height - 1);

        return [this.imageData, highlightImage];
    }

    carveVertical() {
        let path = this.findVerticalPath(this.gsMatrix);
        let [newData, highlightData] = this.removeVerticalPath(this.imageData.data, this.gsMatrix, path);
        let highlightImage = new ImageData(highlightData, this.imageData.width, this.imageData.height);
        this.imageData = new ImageData(newData, this.imageData.width - 1, this.imageData.height);

        return [this.imageData, highlightImage];
    }

    sobel(matrix) {
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

    toGsMatrix(imageData, width) {
        let matrix = [];
        for (let i = 0; i < imageData.length; i += 4 * width) {
            let row = [];
            for (let j = 0; j < 4 * width; j += 4) {
                let pixel = imageData.slice(i + j, i + j + 4);
                row.push((pixel[0] + pixel[1] + pixel[2]) / 3);
            }
            matrix.push(row);
        }
        return matrix;
    }

    toGsBuffer = (matrix) => {
        return new Uint8ClampedArray(matrix.map((row) => row.map((val) => [val, val, val, 255])).flat(2));
    };

    findVerticalPath(m) {
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

    findHorizontalPath(m) {
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

    removeVerticalPath(imageData, m, path) {
        let newData = new Uint8ClampedArray(imageData.length - path.length * 4);
        let highlightData = new Uint8ClampedArray(imageData.length);
        highlightData.set(imageData);
        let bufferWidth = m[0].length * 4;
        let newBufferWidth = bufferWidth - 4;
        for (let i = 0; i < path.length; ++i) {
            // splice energy matrix
            m[i].splice(path[i], 1);

            // copy image buffer
            let before = imageData.slice(i * bufferWidth, i * bufferWidth + path[i] * 4);
            let after = imageData.slice(i * bufferWidth + path[i] * 4 + 4, (i + 1) * bufferWidth);
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

    removeHorizontalPath(imageData, m, path) {
        let newData = new Uint8ClampedArray(imageData.length - path.length * 4);
        newData.set(imageData.subarray(0, imageData.length - path.length * 4));
        let highlightData = new Uint8ClampedArray(imageData.length);
        highlightData.set(imageData);

        let bufferWidth = m[0].length * 4;
        let newHeight = m.length - 1;
        for (let i = 0; i < path.length; ++i) {
            for (let r = path[i]; r < newHeight; ++r) {
                m[r][i] = m[r + 1][i];

                newData[r * bufferWidth + i * 4] = imageData[r * bufferWidth + i * 4 + bufferWidth];
                newData[r * bufferWidth + i * 4 + 1] = imageData[r * bufferWidth + i * 4 + bufferWidth + 1];
                newData[r * bufferWidth + i * 4 + 2] = imageData[r * bufferWidth + i * 4 + bufferWidth + 2];
                newData[r * bufferWidth + i * 4 + 3] = imageData[r * bufferWidth + i * 4 + bufferWidth + 3];
            }

            highlightData[path[i] * bufferWidth + i * 4] = 255;
            highlightData[path[i] * bufferWidth + i * 4 + 1] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 2] = 0;
            highlightData[path[i] * bufferWidth + i * 4 + 3] = 255;
        }
        m.pop();
        return [newData, highlightData];
    }

    copyMatrix(m) {
        return m.map((r) => [...r]);
    }

    create2DMatrix(h, w) {
        return [...Array(h)].map((r) => Array(w));
    }
}
