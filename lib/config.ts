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
  // Falls back to the merged colors.primary when not set explicitly, so
  // every preset gets a sensible QR color for free.
  qrColor: string
}

type DeepPartial<T> = { [K in keyof T]?: Partial<T[K]> }

type Override = DeepPartial<Preset> & {
  eventName: string
  cloudinaryFolder: string
  decorationUrl?: string
  qrColor?: string
}

export function mergeEventConfig(preset: Preset, override: Override): EventConfig {
  const colors = { ...preset.colors, ...override.colors }
  return {
    eventName: override.eventName,
    cloudinaryFolder: override.cloudinaryFolder,
    decorationUrl: override.decorationUrl,
    qrColor: override.qrColor ?? colors.primary,
    colors,
    fonts: { ...preset.fonts, ...override.fonts },
    texts: { ...preset.texts, ...override.texts },
    slideshow: { ...preset.slideshow, ...override.slideshow },
    rateLimit: { ...preset.rateLimit, ...override.rateLimit },
  }
}
