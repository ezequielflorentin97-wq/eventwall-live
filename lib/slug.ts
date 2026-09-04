export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function withSuffixIfTaken(baseSlug: string, existingSlugs: string[]): string {
  if (!existingSlugs.includes(baseSlug)) return baseSlug
  let n = 2
  while (existingSlugs.includes(`${baseSlug}-${n}`)) n++
  return `${baseSlug}-${n}`
}
