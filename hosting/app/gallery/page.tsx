
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

// Placeholder gallery data - replace with actual data fetching from Admin Panel
const galleryItems = [
  { id: 'g1', src: '/images/gallery/completed-garage-1.jpg', alt: 'Completed double oak frame garage', caption: 'Spacious 2-bay garage with reclaimed oak finish.', dataAiHint: 'completed oak frame garage countryside' },
  { id: 'g2', src: '/images/gallery/completed-gazebo-1.jpg', alt: 'Oak frame gazebo in a garden setting', caption: 'Elegant 4x4m gazebo, perfect for outdoor entertaining.', dataAiHint: 'finished oak gazebo garden furniture' },
  { id: 'g3', src: '/images/gallery/completed-porch-1.jpg', alt: 'Welcoming oak frame porch on a brick house', caption: 'Custom designed porch adding character to the entrance.', dataAiHint: 'oak porch entrance house brick' },
  { id: 'g4', src: '/images/gallery/oak-beams-interior.jpg', alt: 'Interior room with exposed oak beams', caption: 'Structural oak beams adding warmth and texture.', dataAiHint: 'exposed oak beams ceiling interior living room' },
  { id: 'g5', src: '/images/gallery/oak-flooring-room.jpg', alt: 'Room with newly installed oak flooring', caption: 'Durable and beautiful kilned dried oak flooring.', dataAiHint: 'oak flooring installed room empty' },
  { id: 'g6', src: '/images/gallery/completed-garage-2.jpg', alt: 'Single bay oak frame garage with log store', caption: 'Practical single bay garage with integrated log store.', dataAiHint: 'single oak garage log store side' },
  { id: 'g7', src: '/images/gallery/gazebo-detail.jpg', alt: 'Close up detail of oak gazebo joint', caption: 'Showcasing the craftsmanship of traditional joinery.', dataAiHint: 'oak wood joint detail gazebo' },
   { id: 'g8', src: '/images/gallery/bespoke-structure.jpg', alt: 'Large bespoke oak frame structure under construction', caption: 'Example of a large-scale custom project.', dataAiHint: 'large oak frame construction building' },
];

export default function GalleryPage() {
  return (
    // Removed relative isolate and background image handling
    <div>
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold text-center mb-4">Gallery</h1>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Browse images of our completed projects and see the quality of our craftsmanship. Get inspired for your own timber structure.
          </p>

          {/* Grid of gallery items - Added transparency, blur, lighter border for cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {galleryItems.map((item) => (
              <Card key={item.id} className="overflow-hidden group bg-card/80 backdrop-blur-sm border border-border/50">
                <CardContent className="p-0">
                  <div className="relative aspect-square w-full overflow-hidden">
                     <Image
                        src={`https://picsum.photos/seed/${item.id}/500/500`} // Placeholder
                        alt={item.alt}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.dataAiHint}
                      />
                      {/* Optional: Overlay for caption on hover with adjusted gradient */}
                      {item.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <p className="text-sm text-primary-foreground">{item.caption}</p>
                        </div>
                      )}
                  </div>
                </CardContent>
                {/* Optional: Caption below image - currently disabled
                {item.caption && (
                    <CardFooter className="p-4 text-sm text-muted-foreground">
                        {item.caption}
                    </CardFooter>
                )} */}
              </Card>
            ))}
          </div>
        </div>
    </div>
  );
}

    