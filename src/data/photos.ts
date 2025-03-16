export const FEATURED_IMAGES = [
	{
		url: 'https://i.imgur.com/TkklT6N.jpg',
		title: 'Featured Shot 1',
		description: 'Professional photography capturing moments that last a lifetime'
	},
	{
		url: 'https://i.imgur.com/eZnzOPS.jpg',
		title: 'Featured Shot 2',
		description: 'Artistic perspective through the lens of experience'
	}
] as const;

export const GALLERY_IMAGES = [
	{
		category: 'Portraits',
		images: [
			{ url: 'https://i.imgur.com/WcoD4PT.jpg', title: 'Portrait Study' },
			{ url: 'https://i.imgur.com/gPceaBv.jpg', title: 'Environmental Portrait' },
			{ url: 'https://i.imgur.com/xwZnt0wM.jpg', title: 'Studio Lighting' },
			{ url: 'https://i.imgur.com/EmkcmxZ.jpg', title: 'Natural Light Portrait' },
			{ url: 'https://i.imgur.com/ykqtpwb.jpg', title: 'Character Study' }
		]
	},
	{
		category: 'Landscapes',
		images: [
			{ url: 'https://i.imgur.com/aC9y2Jc.jpg', title: 'Scenic Vista' },
			{ url: 'https://i.imgur.com/iQakYCz.jpg', title: 'Natural Beauty' },
			{ url: 'https://i.imgur.com/3aG8lNQ.jpg', title: 'Golden Hour' },
			{ url: 'https://i.imgur.com/jXL1WOM.jpg', title: 'Dramatic Skies' }
		]
	},
	{
		category: 'Urban',
		images: [
			{ url: 'https://i.imgur.com/KNLwMV0.jpg', title: 'City Life' },
			{ url: 'https://i.imgur.com/ojHgfqD.jpg', title: 'Street Photography' },
			{ url: 'https://i.imgur.com/KFBKNIE.jpg', title: 'Urban Exploration' }
		]
	},
	{
		category: 'Events',
		images: [
			{ url: 'https://i.imgur.com/65MecBy.jpg', title: 'Special Moments' },
			{ url: 'https://i.imgur.com/hnfK4Lt.jpg', title: 'Celebration' },
			{ url: 'https://i.imgur.com/fsDbUZA.jpg', title: 'Gathering' },
			{ url: 'https://i.imgur.com/69yR7W7.jpg', title: 'Candid Moments' },
			{ url: 'https://i.imgur.com/uKHZ0DD.jpg', title: 'Event Coverage' },
			{ url: 'https://i.imgur.com/bdRsoZi.jpg', title: 'Documentary' }
		]
	}
];
