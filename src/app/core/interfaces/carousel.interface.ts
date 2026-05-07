export interface CarouselSlide {
  id: string;
  titleFr: string;
  titleEn: string;
  subtitleFr?: string | null;
  subtitleEn?: string | null;
  imageUrl?: string | null;
  displayOrder: number;
  isActive: boolean;
}
