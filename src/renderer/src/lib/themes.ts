export const fonts = [
  { label: 'Sans', css: "'Segoe UI', Arial, sans-serif" },
  { label: 'Serif', css: "Georgia, 'Times New Roman', serif" },
  { label: 'Impacto', css: "Impact, 'Arial Black', sans-serif" }
]

export const themePresets: Theme[] = [
  {
    id: 'clasico',
    name: 'Clásico',
    bgType: 'solid',
    bg1: '#000000',
    bg2: '#000000',
    gradientAngle: 180,
    textColor: '#ffffff',
    fontFamily: fonts[0].css,
    bold: true,
    uppercase: false,
    shadow: false
  },
  {
    id: 'azul-noche',
    name: 'Azul noche',
    bgType: 'gradient',
    bg1: '#0f172a',
    bg2: '#1e3a8a',
    gradientAngle: 160,
    textColor: '#ffffff',
    fontFamily: fonts[0].css,
    bold: true,
    uppercase: false,
    shadow: true
  },
  {
    id: 'atardecer',
    name: 'Atardecer',
    bgType: 'gradient',
    bg1: '#7c2d12',
    bg2: '#be185d',
    gradientAngle: 135,
    textColor: '#fff7ed',
    fontFamily: fonts[0].css,
    bold: true,
    uppercase: false,
    shadow: true
  },
  {
    id: 'bosque',
    name: 'Bosque',
    bgType: 'gradient',
    bg1: '#052e16',
    bg2: '#166534',
    gradientAngle: 180,
    textColor: '#f0fdf4',
    fontFamily: fonts[0].css,
    bold: true,
    uppercase: false,
    shadow: true
  },
  {
    id: 'pergamino',
    name: 'Pergamino',
    bgType: 'solid',
    bg1: '#f5efe0',
    bg2: '#f5efe0',
    gradientAngle: 180,
    textColor: '#1f2937',
    fontFamily: fonts[1].css,
    bold: false,
    uppercase: false,
    shadow: false
  },
  {
    id: 'contraste',
    name: 'Alto contraste',
    bgType: 'solid',
    bg1: '#000000',
    bg2: '#000000',
    gradientAngle: 180,
    textColor: '#facc15',
    fontFamily: fonts[2].css,
    bold: false,
    uppercase: true,
    shadow: false
  }
]

export function themeBackground(t: Theme): string {
  return t.bgType === 'gradient'
    ? `linear-gradient(${t.gradientAngle}deg, ${t.bg1}, ${t.bg2})`
    : t.bg1
}