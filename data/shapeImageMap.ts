export function getLocalSvgImage(layoutName: string): Promise<string> {
	const svgFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/LShape.svg',
		'UShape': '/assets/images/UShape.svg',
		'SingleWall': '/assets/images/SingleWall.svg',
		'Island': '/assets/images/Island.svg',
		'L-Shaped-Island': '/assets/images/L-Shaped-Island.svg',
		'Angled-shaped': '/assets/images/Angled-shaped.svg',
		'Angled-shaped-Island': '/assets/images/Angled-shaped-Island.svg',
	};
	return fetch(svgFallbackMap[layoutName]).then(response => response.text());
}

// Function to get PNG image from database layout or fallback to PNG assets (Selection Screen)
export function getShapePngImage(layoutName: string): string {
	
	// PNG fallbacks for selection screen
	const pngFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/shapeSelector/LShape.png',
		'UShape': '/assets/images/shapeSelector/UShape.png',
		'SingleWall': '/assets/images/shapeSelector/SingleWall.png',
		'Island': '/assets/images/shapeSelector/Island.png',
		'L-Shaped-Island': '/assets/images/shapeSelector/L-Shaped-Island.png',
		'Angled-shaped': '/assets/images/shapeSelector/Angled-shaped.png',
		'Angled-shaped-Island': '/assets/images/shapeSelector/Angled-shaped-Island.png',
	};
	
	return pngFallbackMap[layoutName] || '/assets/images/shapeSelector/LShape.png';
}

// Fallback mapping for different naming conventions (legacy support)
export const shapeImageFallback: Record<string, string> = {
	'L Shape': '/assets/images/shapeSelector/LShape.png',
	'U Shape': '/assets/images/shapeSelector/UShape.png',
	'Single Wall': '/assets/images/shapeSelector/SingleWall.png',
	'Kitchen Island': '/assets/images/shapeSelector/Island.png',
	'L-Shaped Island': '/assets/images/shapeSelector/L-Shaped-Island.png',
	'Angled Shape': '/assets/images/shapeSelector/Angled-shaped.png',
	'Angled Island': '/assets/images/shapeSelector/Angled-shaped-Island.png',
	'L-shape': '/assets/images/shapeSelector/LShape.png',
	'U-shape': '/assets/images/shapeSelector/UShape.png',
	'Straight': '/assets/images/shapeSelector/SingleWall.png',
	'L-shaped-Island': '/assets/images/shapeSelector/L-Shaped-Island.png',
}; 