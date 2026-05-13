import type { ImagePiece } from '#types';
import { hash } from 'hasha';
import zip from 'just-zip-it';
import fs from 'node:fs';
import { outdent } from 'outdent';
import path from 'pathe';
import sharp from 'sharp';
import { monorepoDirpath } from './paths.ts';

export async function generateReadmeMarkdownFile({
	imageWidth,
	darkModeImagePieces,
	lightModeImagePieces
}: {
	imageWidth: number;
	darkModeImagePieces: ImagePiece[];
	lightModeImagePieces: ImagePiece[];
}) {
	// We use GitHub pages to host our static images since it seems like that's more
	// reliable compared to using `raw.githubusercontent.com` URLs.
	const getImagePieceSrc = ({ filepath }: ImagePiece) =>
    `https://leticiallsousa.github.io/leticiallsousa/generator/generated/${path.basename(filepath)}`;

	const getImgWidth = (width: number) => `${(width / imageWidth) * 100}%`;

	const readmeFooter = outdent({ trimLeadingNewline: false })`
		###### The above image is interactive! Try clicking on the tabs

		<picture>
		  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/leticiallsousa/leticiallsousa/output/github-snake-dark.svg" />
		  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/leticiallsousa/leticiallsousa/output/github-snake.svg" />
		  <img alt="github-snake" src="https://raw.githubusercontent.com/leticiallsousa/leticiallsousa/output/github-snake.svg" />
		</picture>
	`;

	const readme = zip(lightModeImagePieces, darkModeImagePieces).map(
		([lightModeImagePiece, darkModeImagePiece]) => {
			const { href, newTab } = lightModeImagePiece;
			const imgWidth = getImgWidth(lightModeImagePiece.width);
			const lightModeImgSrc = getImagePieceSrc({
				...lightModeImagePiece,
				theme: 'light',
			});
			const darkModeImgSrc = getImagePieceSrc({
				...darkModeImagePiece,
				theme: 'dark',
			});

			const pictureHtml = outdent`
				<picture><source media="(prefers-color-scheme: light)" srcset="${lightModeImgSrc}"><source media="(prefers-color-scheme: dark)" srcset="${darkModeImgSrc}"><img src="${lightModeImgSrc}" width="${imgWidth}" /></picture>
			`;

			const markdown = href === null ?
				pictureHtml :
				`<a href="${href}" ${newTab ? 'target="_blank"' : ''}>${pictureHtml}</a>`;

			return markdown;
		},
	).join('') + readmeFooter;

	await fs.promises.writeFile(
		path.join(monorepoDirpath, '../readme.markdown'),
		readme,
	);
}