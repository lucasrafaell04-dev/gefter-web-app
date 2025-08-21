// Function to get SVG image from database layout or fallback to SVG assets (Measurements Screen)
export function getShapeSvgImage(layoutName: string, layoutImage?: string): string {
	// Prefer database-provided image URL when present
	if (layoutImage && layoutImage.trim() !== '') {
		return layoutImage;
	}
	
	// SVG fallbacks for measurements screen
	const svgFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/LShape.svg',
		'UShape': '/assets/images/UShape.svg',
		'SingleWall': '/assets/images/SingleWall.svg',
		'Island': '/assets/images/Island.svg',
		'L-Shaped-Island': '/assets/images/L-Shaped-Island.svg',
		'Angled-shaped': '/assets/images/Angled-shaped.svg',
		'Angled-shaped-Island': '/assets/images/Angled-shaped-Island.svg',
	};
	
	return svgFallbackMap[layoutName] || '/assets/images/LShape.svg';
}

// Function to get PNG image from database layout or fallback to PNG assets (Selection Screen)
export function getShapePngImage(layoutName: string): string {
	
	// PNG fallbacks for selection screen
	const pngFallbackMap: Record<string, string> = {
		'LShape': '/assets/images/LShape.png',
		'UShape': '/assets/images/UShape.png',
		'SingleWall': '/assets/images/SingleWall.png',
		'Island': '/assets/images/Island.png',
		'L-Shaped-Island': '/assets/images/L-Shaped-Island.png',
		'Angled-shaped': '/assets/images/Angled-shaped.png',
		'Angled-shaped-Island': '/assets/images/Angled-shaped-Island.png',
	};
	
	return pngFallbackMap[layoutName] || '/assets/images/LShape.png';
}

// Fallback mapping for different naming conventions (legacy support)
export const shapeImageFallback: Record<string, string> = {
	'L Shape': '/assets/images/LShape.png',
	'U Shape': '/assets/images/UShape.png',
	'Single Wall': '/assets/images/SingleWall.png',
	'Kitchen Island': '/assets/images/Island.png',
	'L-Shaped Island': '/assets/images/L-Shaped-Island.png',
	'Angled Shape': '/assets/images/Angled-shaped.png',
	'Angled Island': '/assets/images/Angled-shaped-Island.png',
	'L-shape': '/assets/images/LShape.png',
	'U-shape': '/assets/images/UShape.png',
	'Straight': '/assets/images/SingleWall.png',
	'L-shaped-Island': '/assets/images/L-Shaped-Island.png',
}; 