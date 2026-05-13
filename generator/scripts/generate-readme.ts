#!/usr/bin/env tsx

import ora from 'ora';
import path from 'pathe';
import sharp from 'sharp';
import { generateImagePieces } from '../utils/image.ts';
import { monorepoDirpath } from '../utils/paths.ts';
import { generateReadmeMarkdownFile } from '../utils/readme.ts';

const lightModeImageFilepath = path.join(
	monorepoDirpath,
	'data/figma-exports/README (Light Mode).png',
);
const darkModeImageFilepath = path.join(
	monorepoDirpath,
	'data/figma-exports/README (Dark Mode).png',
);

const image = sharp(lightModeImageFilepath);
const { width: imageWidth, height: imageHeight } = await image.metadata();

if (!imageWidth || !imageHeight) {
	throw new Error('Could not get image dimensions');
}

const spinner = ora('Generating README images...').start();

const [
	lightModeImagePieces,
	darkModeImagePieces,
] = await Promise
	.all([
		generateImagePieces({ imageFilepath: lightModeImageFilepath }),
		generateImagePieces({ imageFilepath: darkModeImageFilepath }),
	]);

spinner.text = 'Generating README...';

await generateReadmeMarkdownFile({
	lightModeImagePieces,
	darkModeImagePieces,
	imageWidth,
});

spinner.succeed('README generated!');
