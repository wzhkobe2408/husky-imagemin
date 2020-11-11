const mime = require('mime');
const fs = require('fs');
const path = require('path');
// const prompts = require('prompts');
const imagemin = require('imagemin-overwrite');
const imageminJpegtran = require('imagemin-jpegtran');
const imageminPngquant = require('imagemin-pngquant');
const { exec } = require('./exec');

const Color = {
    green: (text) => `\x1B[32m${text}\x1B[39m`,
    yellow: (text) => `\x1B[33m${text}\x1B[39m`,
    red: (text) => `\x1B[31m${text}\x1B[39m`,
    magentaBright: (text) => `\x1B[95m${text}\x1B[39m`,
    cyanBright: (text) => `\x1B[96m${text}\x1B[39m`,
};

/** @description 超过50kb的图片定义为大图片 */
let largeImageSize = 50;

/**
 * @param path {string}
 */
function isImage(path) {
    return mime.getType(path).startsWith('image/');
}

/**
 * @param path {string}
 */
function getFileSize(path) {
    try {
        return Number(fs.statSync(path).size / 1024).toFixed(1);
    } catch (error) {
        console.log(Color.red(error.message));
    }
}

async function checkAddedImages() {
    try {
        /** @type {string} */
        const diffRes = exec('git diff --cached --name-status', {trim: true});
        const addedDiffReg = /^A\s+(.*)/
        
        const addedImages = diffRes.split('\n')
            .filter(line => line.startsWith('A'))
            .map(line => line.match(addedDiffReg)[1])
            .filter(isImage);
    
        // 原来的图片信息
        const largeImages = addedImages.map(image => {
            const absPath = path.resolve(process.cwd(), image);
            const imageSize = Number(getFileSize(absPath));
            const isLargeImage = imageSize > largeImageSize;
    
            return isLargeImage ? ({
                size: imageSize,
                path: absPath,
                relativePath: image,
            }) : null
        }).filter(Boolean);
    
        if (largeImages.length) {
            console.log(Color.yellow(`Following images size is over ${largeImageSize}kb: `))
            largeImages.forEach(imageInfo => {
                console.log(`${Color.red('➜')}  ${imageInfo.relativePath}: ${Color.red(imageInfo.size + 'kb')}`);
            });
            const largeImagesMap = largeImages.reduce((res, cur) => {
                res[cur.path] = cur.size;
                return res;
            }, {});
    
            // const { optimize } = await prompts({
            //     type: 'confirm',
            //     name: 'optimize',
            //     message: `Do you want to optimize images?`
            // });
    
            // if (optimize) {
                // const { optImgs } = await prompts({
                //     type: 'multiselect',
                //     name: 'optImgs',
                //     message: `Pick images to optimize`,
                //     choices: largeImages.map(imageInfo => ({
                //         title: imageInfo.path,
                //         value: imageInfo.path,
                //     }))
                // });
    
                await imagemin(largeImages.map(imageInfo => imageInfo.path), {
                    plugins: [
                        imageminJpegtran(),
                        imageminPngquant({
                            quality: [0.8, 0.9]
                        })
                    ]
                });
                
                console.log(Color.green(`\nOptimization result: `))
                largeImages.forEach(imageInfo => {
                    const imgPath = imageInfo.path;

                    console.log(
                        `${Color.green('➜')}  ${path.relative(process.cwd(), imgPath)} ${Color.green(`↓${(largeImagesMap[imgPath] - Number(getFileSize(imgPath))).toFixed(1)}kb`)}`
                    );
                    exec(`git add ${imgPath}`);
                });
            // }
        }
    } catch (error) {
        process.exit(1)
    }
}

if (['--help', '-h'].includes(process.argv[2])) {
    console.log(`
Usage: imagemin-overwrite
Default largesize image is defined as size larger than ${Color.yellow('50kb')}, if you want to customize,
you can pass option by run ${Color.yellow('imagemin-overwrite --size=<size>')}
    `)
} else {
    if (process.argv[2] && process.argv[2].startsWith('--size=')) {
        largeImageSize = Number(process.argv[2].split('=')[1]);
    }
    checkAddedImages();
}
