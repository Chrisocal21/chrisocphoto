export const FEATURED_IMAGES = [
	{
		url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=1500&q=80',
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
			{ url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&w=800&q=80', title: 'Modern Architecture' }
		]
	}
];
