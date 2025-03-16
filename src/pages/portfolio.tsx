import Layout from '@/components/Layout'
import { GALLERY_IMAGES } from '@/data/photos'
import Image from 'next/image'

export default function Portfolio() {
	return (
		<Layout title="Portfolio - ChrisOC Photo">
			<div className="pt-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
				{GALLERY_IMAGES.map((category) => (
					<div key={category.category} className="mb-12">
						<h2 className="text-3xl font-semibold mb-6">{category.category}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
							{category.images.map((image) => (
								<div key={image.title} className="relative aspect-[4/3] overflow-hidden rounded-lg neo-card">
									<Image
										src={image.url}
										alt={image.title}
										fill
										style={{ objectFit: 'cover' }}
										quality={80}
									/>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</Layout>
	)
}
