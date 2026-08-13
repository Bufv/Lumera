/**
 * A replaceable artwork entry. Product pages refer to the stable key rather
 * than importing a temporary icon or final PNG directly.
 */
export type ArtworkAsset = {
  src: string;
  alt?: string;
  objectPosition?: string;
};

export type ArtworkManifest = Readonly<Record<string, ArtworkAsset | string>>;

function svgData(svg: string): string {
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const integersClay = svgData(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><linearGradient id="p" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b8a6ff"/><stop offset="1" stop-color="#7054e8"/></linearGradient><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#3e2f7d" flood-opacity=".22"/></filter></defs>
<g filter="url(#s)"><rect x="28" y="34" width="200" height="126" rx="25" fill="#faf3e9" stroke="#8068df" stroke-width="9"/><path d="M50 101h156" stroke="#7054e8" stroke-width="7" stroke-linecap="round"/><path d="M50 101l12-9m-12 9 12 9m144-9-12-9m12 9-12 9" stroke="#7054e8" stroke-width="6" stroke-linecap="round"/><g stroke="#7054e8" stroke-width="5"><path d="M82 88v26"/><path d="M108 88v26"/><path d="M134 88v26"/><path d="M160 88v26"/><path d="M186 88v26"/></g><g font-family="Arial" font-size="19" font-weight="700" fill="#6550c6" text-anchor="middle"><text x="82" y="140">−2</text><text x="108" y="140">−1</text><text x="134" y="140">0</text><text x="160" y="140">1</text><text x="186" y="140">2</text></g><rect x="45" y="174" width="43" height="43" rx="13" fill="url(#p)"/><rect x="96" y="174" width="43" height="43" rx="13" fill="#62a0fb"/><rect x="147" y="174" width="43" height="43" rx="13" fill="#f4b725"/><g font-family="Arial" font-size="21" font-weight="800" fill="white" text-anchor="middle"><text x="66" y="202">−3</text><text x="117" y="202">0</text><text x="168" y="202">2</text></g></g>
</svg>`);

const fractionsClay = svgData(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#9a6900" flood-opacity=".2"/></filter></defs>
<g filter="url(#s)"><circle cx="119" cy="112" r="68" fill="#f4b725"/><path d="M119 112V44a68 68 0 0 1 68 68z" fill="#f39b35"/><path d="M119 112h68a68 68 0 0 1-20 48z" fill="#61ad68"/><path d="M119 112l48 48a68 68 0 0 1-48 20z" fill="#62a0fb"/><g font-family="Arial" font-size="23" font-weight="800" fill="white" text-anchor="middle"><text x="153" y="82">½</text><text x="151" y="145">¼</text></g><rect x="55" y="178" width="116" height="48" rx="16" fill="#fff8eb" stroke="#eadbc2" stroke-width="4"/><text x="113" y="210" font-family="Arial" font-size="31" font-weight="800" fill="#e58b21" text-anchor="middle">0.75</text><rect x="179" y="178" width="39" height="39" rx="10" fill="#f4b725"/><rect x="198" y="178" width="20" height="39" rx="10" fill="#fff8eb"/></g>
</svg>`);

const ratioClay = svgData(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#3e2f7d" flood-opacity=".22"/></filter></defs>
<g filter="url(#s)" stroke-linecap="round" stroke-linejoin="round"><path d="M128 52v121" stroke="#7054e8" stroke-width="13"/><path d="M69 70h118" stroke="#7054e8" stroke-width="13"/><path d="M69 70l-28 56m28-56 28 56m90-56-28 56m28-56 28 56" stroke="#7054e8" stroke-width="5"/><path d="M36 126h66c-6 24-58 24-66 0Z" fill="#8068df" stroke="#8068df" stroke-width="3"/><path d="M154 126h66c-6 24-58 24-66 0Z" fill="#8068df" stroke="#8068df" stroke-width="3"/><rect x="52" y="94" width="34" height="34" rx="9" fill="#62a0fb" stroke="none"/><rect x="170" y="88" width="34" height="40" rx="9" fill="#ef6d88" stroke="none"/><g font-family="Arial" font-size="23" font-weight="800" fill="white" text-anchor="middle" stroke="none"><text x="69" y="119">3</text><text x="187" y="116">5</text></g><rect x="79" y="180" width="98" height="43" rx="14" fill="#fff9ef" stroke="#e7dece" stroke-width="3"/><text x="128" y="209" font-family="Arial" font-size="28" font-weight="800" fill="#5f70cd" text-anchor="middle" stroke="none">3 : 5</text></g>
</svg>`);

const algebraClay = svgData(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
<defs><filter id="s" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="8" stdDeviation="7" flood-color="#9a6900" flood-opacity=".18"/></filter></defs>
<g filter="url(#s)"><rect x="31" y="45" width="194" height="111" rx="25" fill="#fff8eb" stroke="#eadbc2" stroke-width="5"/><g font-family="Arial" font-size="47" font-weight="800" text-anchor="middle"><text x="76" y="118" fill="#7054e8">a</text><text x="113" y="118" fill="#58a84f">x</text><text x="151" y="118" fill="#6f7077">+</text><text x="188" y="118" fill="#ee9226">b</text></g><text x="54" y="208" font-family="Arial" font-size="49" font-weight="900" fill="#7657df">×</text><circle cx="117" cy="192" r="23" fill="#f39b35"/><rect x="150" y="170" width="75" height="23" rx="8" fill="#8068df"/><rect x="146" y="191" width="79" height="22" rx="8" fill="#ee9226"/><rect x="151" y="211" width="74" height="20" rx="8" fill="#58a84f"/></g>
</svg>`);

/**
 * Approved local artwork is mapped to stable product keys here so page
 * components never need to import presentation assets directly.
 */
export const artworkManifest: ArtworkManifest = {
  'course-integers': {
    src: integersClay,
    alt: 'Ilustrasi clay 3D garis bilangan dan bilangan bulat',
    objectPosition: 'center',
  },
  'course-fractions-decimals': {
    src: fractionsClay,
    alt: 'Ilustrasi clay 3D pecahan dan desimal',
    objectPosition: 'center',
  },
  'course-ratio-scale': {
    src: ratioClay,
    alt: 'Ilustrasi clay 3D perbandingan dan skala',
    objectPosition: 'center',
  },
  'course-algebraic-expressions': {
    src: algebraClay,
    alt: 'Ilustrasi clay 3D bentuk aljabar',
    objectPosition: 'center',
  },
};
