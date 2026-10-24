// Cast of the episode. Pathfinder outfits are a stylised activity uniform
// (cream shirt, navy trousers/skirt, yellow scarf) with no official insignia.
import { P } from '../core/palette.js';
import { createHuman } from './humanoid.js';

export const CAST = {
  lucas: { name: 'Lucas', skin: P.skins[2], hair: 'short', hairColor: P.hairs[1], patch: P.green },
  ana: { name: 'Ana', skin: P.skins[4], hair: 'braids', hairColor: P.hairs[5], skirt: true, patch: P.turquoise },
  pedro: { name: 'Pedro', skin: P.skins[1], hair: 'spiky', hairColor: P.hairs[0], patch: P.yellow },          // wheelchair user
  clara: { name: 'Clara', skin: P.skins[0], hair: 'ponytail', hairColor: P.hairs[3], patch: P.royal },         // blind, long cane
  rafael: { name: 'Rafael', skin: P.skins[3], hair: 'curly', hairColor: P.hairs[5], hearingAid: P.turquoise, patch: P.orange }, // deaf
  bia: { name: 'Bia', skin: P.skins[1], hair: 'bun', hairColor: P.hairs[2], skirt: true, glasses: '#E5484D', patch: P.pink },   // intellectual disability
  theo: { name: 'Theo', skin: P.skins[2], hair: 'buzz', hairColor: P.hairs[0], glasses: P.navy, patch: P.turquoise },           // multiple disability, power chair + AAC
  joao: { name: 'João', skin: P.skins[5], hair: 'buzz', hairColor: P.hairs[5], patch: P.red },
  lia: { name: 'Lia', skin: P.skins[2], hair: 'long', hairColor: P.hairs[0], patch: P.green, lanyard: true },  // hidden disability (sunflower lanyard)
  caio: { name: 'Caio', skin: P.skins[0], hair: 'short', hairColor: P.hairs[4], patch: P.orange },
  nina: { name: 'Nina', skin: P.skins[3], hair: 'ponytail', hairColor: P.hairs[1], skirt: true, patch: P.red },
  director: { name: 'Diretora Márcia', adult: true, skin: P.skins[3], hair: 'wavyAdult', hairColor: P.hairs[5], glasses: '#3A2F5C', patch: P.yellow },

  jesus: { name: 'Jesus', adult: true, skin: '#B98A62', hair: 'wavyAdult', hairColor: '#3B2418', beard: true, outfit: 'robe', colors: { robe: '#E9DFC9', robe2: '#B9A27E', sash: '#8A6A44' }, mantle: '#5E7FA3' },
  bethesdaMan: { name: 'Homem de Betesda', adult: true, skin: '#A8774F', hair: 'short', hairColor: '#6E655E', beard: true, beardColor: '#7D746C', outfit: 'robe', colors: { robe: '#BBA98A', robe2: '#8E7B5E', sash: '#6B5A44' }, dims: { torso: 1.12 } },
  leader1: { name: 'Líder religioso', adult: true, skin: '#B07E55', hair: 'short', hairColor: '#2A1C16', beard: true, outfit: 'robe', colors: { robe: '#4B3F6B', robe2: '#362C52', sash: '#C9A34A' }, tallit: true, headcloth: '#EDE6D6' },
  leader2: { name: 'Líder religioso', adult: true, skin: '#9C6B47', hair: 'short', hairColor: '#4A3A30', beard: true, beardColor: '#8C8C8C', outfit: 'robe', colors: { robe: '#3E5A6E', robe2: '#2C4252', sash: '#C9A34A' }, tallit: true, headcloth: '#E9E2D2' },
  david: { name: 'Rei Davi', adult: true, skin: '#B88458', hair: 'wavyAdult', hairColor: '#6B3E22', beard: true, outfit: 'royal', crown: true, colors: { robe: '#5B3A8C', robe2: '#40286A', cape: '#B3263A' } },
  mefibosete: { name: 'Mefibosete', adult: true, skin: '#B07A50', hair: 'short', hairColor: '#2E1E16', beard: true, outfit: 'robe', colors: { robe: '#9C8B6E', robe2: '#7A6A50', sash: '#5A6E8C' }, mantle: '#6E5A8C' },
  messenger: { name: 'Mensageiro', adult: true, skin: '#A87650', hair: 'short', hairColor: '#2A1C16', outfit: 'robe', colors: { robe: '#B07A44', robe2: '#875A2E', sash: '#4A6A8C' }, headcloth: '#E2D3B3', headband: '#4A6A8C' },
  guest1: { name: 'Convidado', adult: true, skin: '#A87650', hair: 'short', hairColor: '#3A2418', beard: true, outfit: 'robe', colors: { robe: '#5E7F6E', robe2: '#46604F', sash: '#C9A34A' }, headcloth: '#E9DFC9' },
  guest2: { name: 'Convidada', adult: true, skin: '#B88458', hair: 'long', hairColor: '#2A1C16', outfit: 'robe', colors: { robe: '#A0526A', robe2: '#7E3D52', sash: '#C9A34A' }, headcloth: '#F0E2C8' },
  teacher: { name: 'Professora', adult: true, skin: P.skins[2], hair: 'bun', hairColor: P.hairs[0], glasses: P.navy, outfit: 'edwardian', colors: { robe: '#13B9C5', robe2: '#0E8F99' } },
  helenChild: { name: 'Helen Keller (criança)', skin: P.skins[0], hair: 'wavyLong', hairColor: '#9C6A3A', outfit: 'victorianChild', colors: { shirt: '#F7F3EA' } },
  anne: { name: 'Anne Sullivan', adult: true, skin: '#F2CFB0', hair: 'victorianBun', hairColor: '#3A2418', outfit: 'victorianWoman', colors: { robe: '#3E3550', robe2: '#2C253A' } },
  helenAdult: { name: 'Helen Keller (adulta)', adult: true, skin: P.skins[0], hair: 'victorianBun', hairColor: '#7A5230', outfit: 'edwardian', colors: { robe: '#E6DDEE', robe2: '#C9BCD8' } },
  helenGrad: { name: 'Helen Keller (formatura)', adult: true, skin: P.skins[0], hair: 'victorianBun', hairColor: '#7A5230', outfit: 'gown', mortarboard: true },
};

export function make(key, extra = {}) {
  const def = CAST[key];
  return createHuman({ ...def, ...extra, colors: { ...(def.colors || {}), ...(extra.colors || {}) } });
}
