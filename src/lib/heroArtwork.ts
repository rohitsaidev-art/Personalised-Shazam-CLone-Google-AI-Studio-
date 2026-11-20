// Client-side static ES imports so Vite bundles & hashes all 8 flagship editorial covers cleanly
import coverLoverGirl from '../assets/images/cover_lover_girl_1795173822704.jpg';
import coverNoChurch from '../assets/images/cover_no_church_1795173822125.jpg';
import coverPutaapuGang from '../assets/images/cover_putaapu_gang_1795173828460.jpg';
import coverIndecisive from '../assets/images/cover_indecisive_1795173822588.jpg';
import coverUyirilThodum from '../assets/images/cover_uyiril_thodum_1795173822114.jpg';
import coverMehrama from '../assets/images/cover_mehrama_1795173822275.jpg';
import coverDilBekarar from '../assets/images/cover_dil_bekarar_1795173826313.jpg';
import coverKahani from '../assets/images/cover_kahani_1795173827889.jpg';

export interface HeroCoverEntry {
  imageUrl: string;
  imageScale: number;
}

export const HERO_COVERS_BY_TITLE: Record<string, HeroCoverEntry> = {
  'Lover Girl': { imageUrl: coverLoverGirl, imageScale: 1.07 },
  'No Church in the Wild (feat. Frank Ocean & The-Dream)': {
    imageUrl: coverNoChurch,
    imageScale: 1.02,
  },
  'Putaapu Gang': { imageUrl: coverPutaapuGang, imageScale: 1.08 },
  'Indecisive (Is It A Crime)': { imageUrl: coverIndecisive, imageScale: 1.09 },
  'Uyiril Thodum (From "Kumbalangi Nights")': {
    imageUrl: coverUyirilThodum,
    imageScale: 1.06,
  },
  'Mehrama (Extended)': { imageUrl: coverMehrama, imageScale: 1.02 },
  'Dil Ye Bekarar Kyun Hai': { imageUrl: coverDilBekarar, imageScale: 1.02 },
  'Kahani (From "Laal Singh Chaddha")': { imageUrl: coverKahani, imageScale: 1.02 },
};

export const HERO_COVER_COUNT = Object.keys(HERO_COVERS_BY_TITLE).length;
