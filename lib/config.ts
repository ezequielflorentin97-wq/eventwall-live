export type Preset = {
  colors: { bg: string; primary: string; dark: string; text: string; uploadBg: string }
  fonts: { display: string; body: string }
  texts: { homeTitle: string; qrSubtitle: string; uploadTitle: string; footerText: string }
  slideshow: { slideMs: number; pauseMs: number }
  rateLimit: { max: number; windowMs: number }
}

export type EventConfig = Preset & {
  eventName: string
  cloudinaryFolder: string
  decorationUrl?: string
  // Brand/event logo (company logo, sponsor logo, event crest) shown on the
  // home view and display footer. Uploaded via the wizard — see
  // components/admin/LogoUploader.tsx.
  logoUrl?: string
  // Falls back to the merged colors.primary when not set explicitly, so
  // every preset gets a sensible QR color for free.
  qrColor: string
  // See lib/textEffects.ts — 'ninguno' when not set.
  titleEffect: string
}

type DeepPartial<T> = { [K in keyof T]?: Partial<T[K]> }

type Override = DeepPartial<Preset> & {
  eventName: string
  cloudinaryFolder: string
  decorationUrl?: string
  logoUrl?: string
  qrColor?: string
  titleEffect?: string
}

export function mergeEventConfig(preset: Preset, override: Override): EventConfig {
  const colors = { ...preset.colors, ...override.colors }
  return {
    eventName: override.eventName,
    cloudinaryFolder: override.cloudinaryFolder,
    decorationUrl: override.decorationUrl,
    logoUrl: override.logoUrl,
    qrColor: override.qrColor ?? colors.primary,
    titleEffect: override.titleEffect ?? 'ninguno',
    colors,
    fonts: { ...preset.fonts, ...override.fonts },
    texts: { ...preset.texts, ...override.texts },
    slideshow: { ...preset.slideshow, ...override.slideshow },
    rateLimit: { ...preset.rateLimit, ...override.rateLimit },
  }
}
