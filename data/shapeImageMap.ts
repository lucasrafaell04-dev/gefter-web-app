export function getLocalSvgImage(layoutName: string): Promise<string> {
	const svgFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/LShape.svg',
		'UShape': '/assets/images/UShape.svg',
		'SingleWall': '/assets/images/SingleWall.svg',
		'Island': '/assets/images/Island.svg',
		'L-Shaped-Island': '/assets/images/L-Shaped-Island.svg',
		'Angled-shaped': '/assets/images/Angled-shaped.svg',
		'Angled-shaped-Island': '/assets/images/Angled-shaped-Island.svg',
		'SinglePiece': '/assets/images/SinglePiece.svg'
	};
	return fetch(svgFallbackMap[layoutName]).then(response => response.text());
}

export function getShapePngImage(layoutName: string): string {
	
	const pngFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/shapeSelector/LShape.png',
		'UShape': '/assets/images/shapeSelector/UShape.png',
		'SingleWall': '/assets/images/shapeSelector/SingleWall.png',
		'Island': '/assets/images/shapeSelector/Island.png',
		'L-Shaped-Island': '/assets/images/shapeSelector/L-Shaped-Island.png',
		'Angled-shaped': '/assets/images/shapeSelector/Angled-shaped.png',
		'Angled-shaped-Island': '/assets/images/shapeSelector/Angled-shaped-Island.png',
		'SinglePiece': '/assets/images/shapeSelector/SinglePiece.png'
	};
	
	return pngFallbackMap[layoutName];
}