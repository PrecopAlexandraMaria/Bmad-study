export interface Artwork {
  id: number;
  title: string;
  artist: string;
  museum: string;
}

export const mockArtworks: Artwork[] = [
  { id: 1, title: 'Mona Lisa', artist: 'Leonardo da Vinci', museum: 'Louvre Museum' },
  { id: 2, title: 'The Starry Night', artist: 'Vincent van Gogh', museum: 'Museum of Modern Art' },
  { id: 3, title: 'The Persistence of Memory', artist: 'Salvador Dalí', museum: 'Museum of Modern Art' },
  { id: 4, title: 'Girl with a Pearl Earring', artist: 'Johannes Vermeer', museum: 'Mauritshuis' },
  { id: 5, title: 'The Night Watch', artist: 'Rembrandt van Rijn', museum: 'Rijksmuseum' },
  { id: 6, title: 'The Kiss', artist: 'Gustav Klimt', museum: 'Österreichische Galerie Belvedere' },
  { id: 7, title: 'Les Demoiselles d\'Avignon', artist: 'Pablo Picasso', museum: 'Museum of Modern Art' },
  { id: 8, title: 'American Gothic', artist: 'Grant Wood', museum: 'Art Institute of Chicago' },
];
