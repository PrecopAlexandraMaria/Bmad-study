import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function seed() {
  const db = await open({
    filename: path.resolve(__dirname, '../database.sqlite'),
    driver: sqlite3.Database
  });

  console.log('🚀 Starting batch import of 100 masterpieces...');

  const masterpieces = [
    { title: "Starry Night", year: 1889, artist: "Vincent van Gogh", artistCountry: "Netherlands", birth: 1853, death: 1890, style: "Post-Impressionism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "The Scream", year: 1893, artist: "Edvard Munch", artistCountry: "Norway", birth: 1863, death: 1944, style: "Expressionism", museum: "National Gallery", city: "Oslo", country: "Norway", lat: 59.9161, lng: 10.7337 },
    { title: "Girl with a Pearl Earring", year: 1865, artist: "Johannes Vermeer", artistCountry: "Netherlands", birth: 1632, death: 1675, style: "Dutch Golden Age", museum: "Mauritshuis", city: "The Hague", country: "Netherlands", lat: 52.0804, lng: 4.3143 },
    { title: "The Persistence of Memory", year: 1931, artist: "Salvador Dali", artistCountry: "Spain", birth: 1904, death: 1989, style: "Surrealism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "The Night Watch", year: 1642, artist: "Rembrandt", artistCountry: "Netherlands", birth: 1606, death: 1669, style: "Baroque", museum: "Rijksmuseum", city: "Amsterdam", country: "Netherlands", lat: 52.3600, lng: 4.8852 },
    { title: "The Birth of Venus", year: 1485, artist: "Sandro Botticelli", artistCountry: "Italy", birth: 1445, death: 1510, style: "Renaissance", museum: "Uffizi Gallery", city: "Florence", country: "Italy", lat: 43.7677, lng: 11.2553 },
    { title: "The Kiss", year: 1907, artist: "Gustav Klimt", artistCountry: "Austria", birth: 1862, death: 1918, style: "Symbolism", museum: "Upper Belvedere", city: "Vienna", country: "Austria", lat: 48.1915, lng: 16.3809 },
    { title: "Las Meninas", year: 1656, artist: "Diego Velazquez", artistCountry: "Spain", birth: 1599, death: 1660, style: "Baroque", museum: "Prado Museum", city: "Madrid", country: "Spain", lat: 40.4137, lng: -3.6921 },
    { title: "The Great Wave off Kanagawa", year: 1831, artist: "Katsushika Hokusai", artistCountry: "Japan", birth: 1760, death: 1849, style: "Ukiyo-e", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "American Gothic", year: 1930, artist: "Grant Wood", artistCountry: "USA", birth: 1891, death: 1942, style: "Regionalism", museum: "Art Institute of Chicago", city: "Chicago", country: "USA", lat: 41.8796, lng: -87.6237 },
    { title: "Guernica", year: 1937, artist: "Pablo Picasso", artistCountry: "Spain", birth: 1881, death: 1973, style: "Cubism", museum: "Reina Sofia", city: "Madrid", country: "Spain", lat: 40.4079, lng: -3.6946 },
    { title: "Nighthawks", year: 1942, artist: "Edward Hopper", artistCountry: "USA", birth: 1882, death: 1967, style: "Realism", museum: "Art Institute of Chicago", city: "Chicago", country: "USA", lat: 41.8796, lng: -87.6237 },
    { title: "The Garden of Earthly Delights", year: 1490, artist: "Hieronymus Bosch", artistCountry: "Netherlands", birth: 1450, death: 1516, style: "Early Netherlandish", museum: "Prado Museum", city: "Madrid", country: "Spain", lat: 40.4137, lng: -3.6921 },
    { title: "The School of Athens", year: 1511, artist: "Raphael", artistCountry: "Italy", birth: 1483, death: 1520, style: "Renaissance", museum: "Vatican Museums", city: "Vatican City", country: "Vatican", lat: 41.9065, lng: 12.4547 },
    { title: "Sunday Afternoon on La Grande Jatte", year: 1884, artist: "Georges Seurat", artistCountry: "France", birth: 1859, death: 1891, style: "Pointillism", museum: "Art Institute of Chicago", city: "Chicago", country: "USA", lat: 41.8796, lng: -87.6237 },
    { title: "Water Lilies", year: 1919, artist: "Claude Monet", artistCountry: "France", birth: 1840, death: 1926, style: "Impressionism", museum: "Musée de l'Orangerie", city: "Paris", country: "France", lat: 48.8637, lng: 2.3227 },
    { title: "Creation of Adam", year: 1512, artist: "Michelangelo", artistCountry: "Italy", birth: 1475, death: 1564, style: "Renaissance", museum: "Sistine Chapel", city: "Vatican City", country: "Vatican", lat: 41.9029, lng: 12.4545 },
    { title: "Impression, Sunrise", year: 1872, artist: "Claude Monet", artistCountry: "France", birth: 1840, death: 1926, style: "Impressionism", museum: "Musée Marmottan Monet", city: "Paris", country: "France", lat: 48.8594, lng: 2.2668 },
    { title: "The Two Fridas", year: 1939, artist: "Frida Kahlo", artistCountry: "Mexico", birth: 1907, death: 1954, style: "Surrealism", museum: "Museo de Arte Moderno", city: "Mexico City", country: "Mexico", lat: 19.4241, lng: -99.1758 },
    { title: "The Thinker", year: 1902, artist: "Auguste Rodin", artistCountry: "France", birth: 1840, death: 1917, style: "Modern", museum: "Musée Rodin", city: "Paris", country: "France", lat: 48.8553, lng: 2.3159 },
    { title: "Campbell's Soup Cans", year: 1962, artist: "Andy Warhol", artistCountry: "USA", birth: 1928, death: 1987, style: "Pop Art", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "The Last Supper", year: 1498, artist: "Leonardo da Vinci", artistCountry: "Italy", birth: 1452, death: 1519, style: "Renaissance", museum: "Santa Maria delle Grazie", city: "Milan", country: "Italy", lat: 45.4659, lng: 9.1709 },
    { title: "Whistler's Mother", year: 1871, artist: "James Abbott McNeill Whistler", artistCountry: "USA", birth: 1834, death: 1903, style: "Realism", museum: "Musée d'Orsay", city: "Paris", country: "France", lat: 48.8599, lng: 2.3265 },
    { title: "Arnolfini Portrait", year: 1434, artist: "Jan van Eyck", artistCountry: "Belgium", birth: 1390, death: 1441, style: "Northern Renaissance", museum: "National Gallery", city: "London", country: "UK", lat: 51.5089, lng: -0.1286 },
    { title: "The Third of May 1808", year: 1814, artist: "Francisco Goya", artistCountry: "Spain", birth: 1746, death: 1828, style: "Romanticism", museum: "Prado Museum", city: "Madrid", country: "Spain", lat: 40.4137, lng: -3.6921 },
    { title: "Medusa", year: 1597, artist: "Caravaggio", artistCountry: "Italy", birth: 1571, death: 1610, style: "Baroque", museum: "Uffizi Gallery", city: "Florence", country: "Italy", lat: 43.7677, lng: 11.2553 },
    { title: "Wanderer above the Sea of Fog", year: 1818, artist: "Caspar David Friedrich", artistCountry: "Germany", birth: 1774, death: 1840, style: "Romanticism", museum: "Kunsthalle Hamburg", city: "Hamburg", country: "Germany", lat: 53.5552, lng: 10.0022 },
    { title: "The Fighting Temeraire", year: 1839, artist: "J.M.W. Turner", artistCountry: "UK", birth: 1775, death: 1851, style: "Romanticism", museum: "National Gallery", city: "London", country: "UK", lat: 51.5089, lng: -0.1286 },
    { title: "Bal du moulin de la Galette", year: 1876, artist: "Pierre-Auguste Renoir", artistCountry: "France", birth: 1841, death: 1919, style: "Impressionism", museum: "Musée d'Orsay", city: "Paris", country: "France", lat: 48.8599, lng: 2.3265 },
    { title: "The Milkmaid", year: 1658, artist: "Johannes Vermeer", artistCountry: "Netherlands", birth: 1632, death: 1675, style: "Dutch Golden Age", museum: "Rijksmuseum", city: "Amsterdam", country: "Netherlands", lat: 52.3600, lng: 4.8852 },
    { title: "Composition with Red Blue and Yellow", year: 1930, artist: "Piet Mondrian", artistCountry: "Netherlands", birth: 1872, death: 1944, style: "De Stijl", museum: "Kunsthaus Zürich", city: "Zurich", country: "Switzerland", lat: 47.3702, lng: 8.5481 },
    { title: "The Son of Man", year: 1964, artist: "Rene Magritte", artistCountry: "Belgium", birth: 1898, death: 1967, style: "Surrealism", museum: "Private Collection", city: "Brussels", country: "Belgium", lat: 50.8503, lng: 4.3517 },
    { title: "The Dance", year: 1910, artist: "Henri Matisse", artistCountry: "France", birth: 1869, death: 1954, style: "Fauvism", museum: "Hermitage Museum", city: "St. Petersburg", country: "Russia", lat: 59.9398, lng: 30.3146 },
    { title: "I and the Village", year: 1911, artist: "Marc Chagall", artistCountry: "Belarus", birth: 1887, death: 1985, style: "Modernism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "The Card Players", year: 1892, artist: "Paul Cezanne", artistCountry: "France", birth: 1839, death: 1906, style: "Post-Impressionism", museum: "Musée d'Orsay", city: "Paris", country: "France", lat: 48.8599, lng: 2.3265 },
    { title: "Self-Portrait with Thorn Necklace", year: 1940, artist: "Frida Kahlo", artistCountry: "Mexico", birth: 1907, death: 1954, style: "Surrealism", museum: "Harry Ransom Center", city: "Austin", country: "USA", lat: 30.2844, lng: -97.7408 },
    { title: "Christina's World", year: 1948, artist: "Andrew Wyeth", artistCountry: "USA", birth: 1917, death: 2009, style: "Realism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Autumn Rhythm (Number 30)", year: 1950, artist: "Jackson Pollock", artistCountry: "USA", birth: 1912, death: 1956, style: "Abstract Expressionism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Black Iris", year: 1926, artist: "Georgia O'Keeffe", artistCountry: "USA", birth: 1887, death: 1986, style: "Modernism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Maman", year: 1999, artist: "Louise Bourgeois", artistCountry: "France", birth: 1911, death: 2010, style: "Contemporary", museum: "Tate Modern", city: "London", country: "UK", lat: 51.5076, lng: -0.0994 },
    { title: "Walking Man I", year: 1960, artist: "Alberto Giacometti", artistCountry: "Switzerland", birth: 1901, death: 1966, style: "Modernism", museum: "UNESCO", city: "Paris", country: "France", lat: 48.8491, lng: 2.3061 },
    { title: "Fountain", year: 1917, artist: "Marcel Duchamp", artistCountry: "France", birth: 1887, death: 1968, style: "Dada", museum: "Tate Modern", city: "London", country: "UK", lat: 51.5076, lng: -0.0994 },
    { title: "The Hay Wain", year: 1821, artist: "John Constable", artistCountry: "UK", birth: 1776, death: 1837, style: "Romanticism", museum: "National Gallery", city: "London", country: "UK", lat: 51.5089, lng: -0.1286 },
    { title: "The Child's Bath", year: 1893, artist: "Mary Cassatt", artistCountry: "USA", birth: 1844, death: 1926, style: "Impressionism", museum: "Art Institute of Chicago", city: "Chicago", country: "USA", lat: 41.8796, lng: -87.6237 },
    { title: "The Dance Class", year: 1874, artist: "Edgar Degas", artistCountry: "France", birth: 1834, death: 1917, style: "Impressionism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Rouen Cathedral Series", year: 1892, artist: "Claude Monet", artistCountry: "France", birth: 1840, death: 1926, style: "Impressionism", museum: "Musée d'Orsay", city: "Paris", country: "France", lat: 48.8599, lng: 2.3265 },
    { title: "Primavera", year: 1482, artist: "Sandro Botticelli", artistCountry: "Italy", birth: 1445, death: 1510, style: "Renaissance", museum: "Uffizi Gallery", city: "Florence", country: "Italy", lat: 43.7677, lng: 11.2553 },
    { title: "Lady with an Ermine", year: 1489, artist: "Leonardo da Vinci", artistCountry: "Italy", birth: 1452, death: 1519, style: "Renaissance", museum: "Czartoryski Museum", city: "Krakow", country: "Poland", lat: 50.0645, lng: 19.9392 },
    { title: "Salvator Mundi", year: 1500, artist: "Leonardo da Vinci", artistCountry: "Italy", birth: 1452, death: 1519, style: "Renaissance", museum: "Louvre Abu Dhabi", city: "Abu Dhabi", country: "UAE", lat: 24.5333, lng: 54.3982 },
    { title: "The Kiss (Sculpture)", year: 1882, artist: "Auguste Rodin", artistCountry: "France", birth: 1840, death: 1917, style: "Modern", museum: "Musée Rodin", city: "Paris", country: "France", lat: 48.8553, lng: 2.3159 },
    { title: "Composition VII", year: 1913, artist: "Wassily Kandinsky", artistCountry: "Russia", birth: 1866, death: 1944, style: "Abstract Art", museum: "Tretyakov Gallery", city: "Moscow", country: "Russia", lat: 55.7414, lng: 37.6208 },
    { title: "A Bigger Splash", year: 1967, artist: "David Hockney", artistCountry: "UK", birth: 1937, death: 0, style: "Pop Art", museum: "Tate Britain", city: "London", country: "UK", lat: 51.4911, lng: -0.1278 },
    { title: "Black Square", year: 1915, artist: "Kazimir Malevich", artistCountry: "Russia", birth: 1879, death: 1935, style: "Suprematism", museum: "Tretyakov Gallery", city: "Moscow", country: "Russia", lat: 55.7414, lng: 37.6208 },
    { title: "View of Toledo", year: 1596, artist: "El Greco", artistCountry: "Greece", birth: 1541, death: 1614, style: "Mannerism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Venus of Urbino", year: 1538, artist: "Titian", artistCountry: "Italy", birth: 1488, death: 1576, style: "Renaissance", museum: "Uffizi Gallery", city: "Florence", country: "Italy", lat: 43.7677, lng: 11.2553 },
    { title: "Calling of St Matthew", year: 1600, artist: "Caravaggio", artistCountry: "Italy", birth: 1571, death: 1610, style: "Baroque", museum: "San Luigi dei Francesi", city: "Rome", country: "Italy", lat: 41.8997, lng: 12.4746 },
    { title: "Paradise", year: 1588, artist: "Tintoretto", artistCountry: "Italy", birth: 1518, death: 1594, style: "Mannerism", museum: "Doge's Palace", city: "Venice", country: "Italy", lat: 45.4337, lng: 12.3404 },
    { title: "Self-Portrait (Lempicka)", year: 1929, artist: "Tamara de Lempicka", artistCountry: "Poland", birth: 1898, death: 1980, style: "Art Deco", museum: "Private Collection", city: "Geneva", country: "Switzerland", lat: 46.2044, lng: 6.1432 },
    { title: "The Epic of American Civilization", year: 1932, artist: "Jose Clemente Orozco", artistCountry: "Mexico", birth: 1883, death: 1949, style: "Muralism", museum: "Dartmouth College", city: "Hanover", country: "USA", lat: 43.7042, lng: -72.2882 },
    { title: "Echo of a Scream", year: 1937, artist: "David Alfaro Siqueiros", artistCountry: "Mexico", birth: 1896, death: 1974, style: "Muralism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Moon and Dog", year: 1955, artist: "Rufino Tamayo", artistCountry: "Mexico", birth: 1899, death: 1991, style: "Modernism", museum: "Art Institute of Chicago", city: "Chicago", country: "USA", lat: 41.8796, lng: -87.6237 },
    { title: "The Farm", year: 1921, artist: "Joan Miro", artistCountry: "Spain", birth: 1893, death: 1983, style: "Surrealism", museum: "National Gallery of Art", city: "Washington D.C.", country: "USA", lat: 38.8913, lng: -77.0199 },
    { title: "The City", year: 1919, artist: "Fernand Leger", artistCountry: "France", birth: 1881, death: 1955, style: "Modernism", museum: "Philadelphia Museum of Art", city: "Philadelphia", country: "USA", lat: 39.9655, lng: -75.1810 },
    { title: "I See Again My Dear Udnie", year: 1914, artist: "Francis Picabia", artistCountry: "France", birth: 1879, death: 1953, style: "Dada", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Unique Forms of Continuity", year: 1913, artist: "Umberto Boccioni", artistCountry: "Italy", birth: 1882, death: 1912, style: "Futurism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Dynamism of a Dog on a Leash", year: 1912, artist: "Giacomo Balla", artistCountry: "Italy", birth: 1871, death: 1958, style: "Futurism", museum: "Albright-Knox Art Gallery", city: "Buffalo", country: "USA", lat: 42.9318, lng: -78.8753 },
    { title: "Monument to the Third International", year: 1919, artist: "Vladimir Tatlin", artistCountry: "Russia", birth: 1885, death: 1953, style: "Constructivism", museum: "State Russian Museum", city: "St. Petersburg", country: "Russia", lat: 59.9386, lng: 30.3322 },
    { title: "Books (Please!)", year: 1924, artist: "Alexander Rodchenko", artistCountry: "Russia", birth: 1891, death: 1956, style: "Constructivism", museum: "State Tretyakov Gallery", city: "Moscow", country: "Russia", lat: 55.7414, lng: 37.6208 },
    { title: "Electric Prisms", year: 1914, artist: "Sonia Delaunay", artistCountry: "Ukraine", birth: 1885, death: 1979, style: "Orphism", museum: "Centre Pompidou", city: "Paris", country: "France", lat: 48.8606, lng: 2.3522 },
    { title: "The Funeral of Anarchist Galli", year: 1911, artist: "Carlo Carra", artistCountry: "Italy", birth: 1881, death: 1966, style: "Futurism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Armored Train in Action", year: 1915, artist: "Gino Severini", artistCountry: "Italy", birth: 1883, death: 1966, style: "Futurism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Homage to Bleriot", year: 1914, artist: "Robert Delaunay", artistCountry: "France", birth: 1885, death: 1941, style: "Orphism", museum: "Kunstmuseum Basel", city: "Basel", country: "Switzerland", lat: 47.5542, lng: 7.5937 },
    { title: "The Burning Giraffe", year: 1937, artist: "Salvador Dali", artistCountry: "Spain", birth: 1904, death: 1989, style: "Surrealism", museum: "Kunstmuseum Basel", city: "Basel", country: "Switzerland", lat: 47.5542, lng: 7.5937 },
    { title: "Senecio", year: 1922, artist: "Paul Klee", artistCountry: "Switzerland", birth: 1879, death: 1940, style: "Modernism", museum: "Kunstmuseum Basel", city: "Basel", country: "Switzerland", lat: 47.5542, lng: 7.5937 },
    { title: "Elephant Celebes", year: 1921, artist: "Max Ernst", artistCountry: "Germany", birth: 1891, death: 1976, style: "Surrealism", museum: "Tate Modern", city: "London", country: "UK", lat: 51.5076, lng: -0.0994 },
    { title: "The Song of Love", year: 1914, artist: "Giorgio de Chirico", artistCountry: "Italy", birth: 1888, death: 1978, style: "Metaphysical", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Bohemia Lies by the Sea", year: 1996, artist: "Anselm Kiefer", artistCountry: "Germany", birth: 1945, death: 0, style: "Contemporary", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Benefits Supervisor Sleeping", year: 1995, artist: "Lucian Freud", artistCountry: "Germany", birth: 1922, death: 2011, style: "Realism", museum: "Private Collection", city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
    { title: "Betty", year: 1988, artist: "Gerhard Richter", artistCountry: "Germany", birth: 1932, death: 0, style: "Contemporary", museum: "Saint Louis Art Museum", city: "St. Louis", country: "USA", lat: 38.6394, lng: -90.2949 },
    { title: "Balloon Dog", year: 1994, artist: "Jeff Koons", artistCountry: "USA", birth: 1955, death: 0, style: "Contemporary", museum: "Broad Museum", city: "Los Angeles", country: "USA", lat: 34.0544, lng: -118.2505 },
    { title: "Girl with Balloon", year: 2002, artist: "Banksy", artistCountry: "UK", birth: 1974, death: 0, style: "Street Art", museum: "Street", city: "London", country: "UK", lat: 51.5074, lng: -0.1278 },
    { title: "Untitled (Skull)", year: 1982, artist: "Jean-Michel Basquiat", artistCountry: "USA", birth: 1960, death: 1988, style: "Neo-Expressionism", museum: "The Broad", city: "Los Angeles", country: "USA", lat: 34.0544, lng: -118.2505 },
    { title: "Radiant Baby", year: 1990, artist: "Keith Haring", artistCountry: "USA", birth: 1958, death: 1990, style: "Contemporary", museum: "Haring Foundation", city: "New York", country: "USA", lat: 40.7128, lng: -74.0060 },
    { title: "Infinity Mirrored Room", year: 1965, artist: "Yayoi Kusama", artistCountry: "Japan", birth: 1929, death: 0, style: "Contemporary", museum: "The Broad", city: "Los Angeles", country: "USA", lat: 34.0544, lng: -118.2505 },
    { title: "The Artist is Present", year: 2010, artist: "Marina Abramovic", artistCountry: "Serbia", birth: 1946, death: 0, style: "Performance Art", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Sunflower Seeds", year: 2010, artist: "Ai Weiwei", artistCountry: "China", birth: 1957, death: 0, style: "Contemporary", museum: "Tate Modern", city: "London", country: "UK", lat: 51.5076, lng: -0.0994 },
    { title: "Lobster Trap and Fish Tail", year: 1939, artist: "Alexander Calder", artistCountry: "USA", birth: 1898, death: 1976, style: "Modernism", museum: "MoMA", city: "New York", country: "USA", lat: 40.7614, lng: -73.9776 },
    { title: "Pelagos", year: 1946, artist: "Barbara Hepworth", artistCountry: "UK", birth: 1903, death: 1975, style: "Modernism", museum: "Tate St Ives", city: "St Ives", country: "UK", lat: 50.2131, lng: -5.4800 },
    { title: "Reclining Figure", year: 1951, artist: "Henry Moore", artistCountry: "UK", birth: 1898, death: 1986, style: "Modernism", museum: "Fitzwilliam Museum", city: "Cambridge", country: "UK", lat: 52.2003, lng: 0.1215 },
    { title: "Brancusi's The Kiss", year: 1916, artist: "Constantin Brancusi", artistCountry: "Romania", birth: 1876, death: 1957, style: "Modernism", museum: "Philadelphia Museum of Art", city: "Philadelphia", country: "USA", lat: 39.9655, lng: -75.1810 },
    { title: "Le Violon d'Ingres", year: 1924, artist: "Man Ray", artistCountry: "USA", birth: 1890, death: 1976, style: "Surrealism", museum: "Centre Pompidou", city: "Paris", country: "France", lat: 48.8606, lng: 2.3522 },
    { title: "Blue Nude", year: 1952, artist: "Henri Matisse", artistCountry: "France", birth: 1869, death: 1954, style: "Fauvism", museum: "Musée Matisse", city: "Nice", country: "France", lat: 43.7194, lng: 7.2764 },
    { title: "Sunflowers", year: 1888, artist: "Vincent van Gogh", artistCountry: "Netherlands", birth: 1853, death: 1890, style: "Post-Impressionism", museum: "National Gallery", city: "London", country: "UK", lat: 51.5089, lng: -0.1286 },
    { title: "Cafe Terrace at Night", year: 1888, artist: "Vincent van Gogh", artistCountry: "Netherlands", birth: 1853, death: 1890, style: "Post-Impressionism", museum: "Kroller-Muller Museum", city: "Otterlo", country: "Netherlands", lat: 52.0950, lng: 5.8167 },
    { title: "Study after Velazquez", year: 1953, artist: "Francis Bacon", artistCountry: "Ireland", birth: 1909, death: 1992, style: "Contemporary", museum: "Des Moines Art Center", city: "Des Moines", country: "USA", lat: 41.5855, lng: -93.6743 },
    { title: "The Anatomy Lesson", year: 1632, artist: "Rembrandt", artistCountry: "Netherlands", birth: 1606, death: 1669, style: "Baroque", museum: "Mauritshuis", city: "The Hague", country: "Netherlands", lat: 52.0804, lng: 4.3143 },
    { title: "The Gross Clinic", year: 1875, artist: "Thomas Eakins", artistCountry: "USA", birth: 1844, death: 1916, style: "Realism", museum: "Philadelphia Museum of Art", city: "Philadelphia", country: "USA", lat: 39.9655, lng: -75.1810 },
    { title: "The Gulf Stream", year: 1899, artist: "Winslow Homer", artistCountry: "USA", birth: 1836, death: 1910, style: "Realism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 },
    { title: "Madame X", year: 1884, artist: "John Singer Sargent", artistCountry: "USA", birth: 1856, death: 1925, style: "Realism", museum: "Metropolitan Museum of Art", city: "New York", country: "USA", lat: 40.7794, lng: -73.9632 }
  ];

  for (const item of masterpieces) {
    try {
      // 1. Country
      await db.run('INSERT OR IGNORE INTO Country (Name) VALUES (?)', item.country);
      const countryRow = await db.get('SELECT CountryID FROM Country WHERE Name = ?', item.country);
      const countryId = countryRow.CountryID;

      // 2. City
      await db.run('INSERT OR IGNORE INTO City (CountryID, Name) VALUES (?, ?)', countryId, item.city);
      const cityRow = await db.get('SELECT CityID FROM City WHERE Name = ?', item.city);
      const cityId = cityRow.CityID;

      // 3. Museum
      await db.run(`INSERT OR IGNORE INTO Museum (CityID, Name, FoundedYear, Latitude, Longitude) VALUES (?, ?, ?, ?, ?)`, cityId, item.museum, 1850, item.lat, item.lng);
      const museumRow = await db.get('SELECT MuseumID FROM Museum WHERE Name = ?', item.museum);
      const museumId = museumRow.MuseumID;

      // 4. Room
      const roomName = `Main Hall ${item.museum}`;
      await db.run('INSERT OR IGNORE INTO Room (MuseumID, Name, Floor) VALUES (?, ?, ?)', museumId, roomName, 1);
      const roomRow = await db.get('SELECT RoomID FROM Room WHERE Name = ? AND MuseumID = ?', roomName, museumId);
      const roomId = roomRow.RoomID;

      // 5. Artist
      await db.run('INSERT OR IGNORE INTO Artist (FullName, Country, BirthYear, DeathYear) VALUES (?, ?, ?, ?)', item.artist, item.artistCountry, item.birth, item.death === 0 ? null : item.death);
      const artistRow = await db.get('SELECT ArtistID FROM Artist WHERE FullName = ?', item.artist);
      const artistId = artistRow.ArtistID;

      // 6. Style
      await db.run('INSERT OR IGNORE INTO ArtStyle (Name) VALUES (?)', item.style);
      const styleRow = await db.get('SELECT StyleID FROM ArtStyle WHERE Name = ?', item.style);
      const styleId = styleRow.StyleID;

      // 7. Artwork
      await db.run('INSERT OR IGNORE INTO Artwork (ArtistID, StyleID, RoomID, Title, YearCreated) VALUES (?, ?, ?, ?, ?)', artistId, styleId, roomId, item.title, item.year);

      console.log(`✅ Imported: "${item.title}" by ${item.artist}`);
    } catch (e: any) {
      console.error(`❌ Failed to import "${item.title}":`, e.message);
    }
  }

  console.log('🎉 Batch import complete!');
}

seed().catch(console.error);
