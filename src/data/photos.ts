export const FEATURED_IMAGES = [
	{
		url: 'https://images.unsplash.com/photo-1504197885-0e21e522f9ac?auto=format&fit=crop&w=1500&q=80',
		title: 'Sunset Over Mountains',
		description: 'A breathtaking view of the sun setting over rugged mountains'
	},
	{
		url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1500&q=80',
		title: 'City Reflections',
		description: 'Modern urban skyline with dazzling reflections'
	}
] as const;

export const GALLERY_IMAGES = [
	{
		category: 'Nature',
		images: [
			{ url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80', title: 'Ocean View' },
			{ url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80', title: 'Forest Waterfall' }
		]
	},
	{
		category: 'Urban',
		images: [
			{ url: 'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80', title: 'City Lights' },
			{ url: 'https://images.unsplash.com/photo-1491895200222-0fc4a2b350d3?auto=format&fit=crop&w=800&q=80', title: 'Modern Architecture' }
		]
	}
];
