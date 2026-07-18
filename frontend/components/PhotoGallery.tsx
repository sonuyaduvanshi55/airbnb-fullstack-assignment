import type { ListingImage } from "@/lib/types";

export function PhotoGallery({ images, title }: { images: ListingImage[]; title: string }) {
  const visible = images.slice(0, 5);
  return (
    <div className="photo-gallery">
      {visible.map((image, index) => (
        <img
          key={image.id || image.url}
          src={image.url}
          alt={image.alt_text || `${title} photo ${index + 1}`}
          className={index === 0 ? "gallery-main" : "gallery-small"}
        />
      ))}
    </div>
  );
}
