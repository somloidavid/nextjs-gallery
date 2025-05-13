import Image from 'next/image';
import path from 'path';
import fs from 'fs';
import { Photo } from './models/photo.model';

const IMAGES_DIR = path.join(process.cwd(), 'public', 'gallery');
const METADATA_FILE = path.join(process.cwd(), 'data', 'photos.json');

async function getPhotos(): Promise<Photo[]> {
  let photos: Photo[] = [];

  try {
    const metadataContent: string = fs.readFileSync(METADATA_FILE, 'utf-8');
    const metadata: Array<Photo> = JSON.parse(metadataContent);

    const filenames: string[] = fs.readdirSync(IMAGES_DIR);

    photos = filenames.map(filename => {
      const photoMetadata: Photo | undefined = metadata.find(item => item.filename === filename);
      return {
        filename,
        title: photoMetadata?.title || '',
        tags: photoMetadata?.tags || []
      };
    });
  } catch (error) {
    console.error('Error loading photos:', error);
    photos = [];
  }

  return photos;
}

async function getTags(photos: Photo[]): Promise<Set<string>> {
  let tags: Set<string> = new Set();

  try {
    photos.forEach(photo => {
      if (photo.tags) {
        photo.tags.forEach(tag => {
          tags.add(tag);
        });
      }
    });
  }
  catch (error) {
    console.error('Error loading tags:', error);
  }

  return tags;
}

export default async function Home() {
  const photos: Photo[] = await getPhotos();
  const tags: Set<string> = await getTags(photos);

  return (
    <div className="container mx-auto p-4 h-screen">
      <h1 className="text-4xl font-bold text-center mb-8">Gallery</h1>

      {[...tags].map((tag, index) => (
        <div key={tag} className={`bg-white p-4 w-1/4 aspect-square m-5 ${ index % 2 === 1 ? 'ml-auto' : ''}`}>
          <div className="grid grid-cols-2 grid-rows-2 gap-2 h-[80%]">
            {photos
              .filter((photo) => photo.tags.includes(tag))
              .slice(0, 4)
              .map((photo) => (
                <div key={photo.filename} className="relative w-full aspect-square">
                  <Image
                    src={`/gallery/${photo.filename}`}
                    alt={photo.title || photo.filename}
                    fill
                    className="object-cover"
                  />
                {/* Overlay to show title or tags on hover */}
                {/* <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-center p-2">
                      <p>{photo.title}</p>
                      <p className="text-sm">{photo.tags.join(', ')}</p>
                    </div> */}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
