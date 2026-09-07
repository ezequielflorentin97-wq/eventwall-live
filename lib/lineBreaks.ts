// Lets a non-technical user just press Enter in a textarea instead of
// typing "<br>". `toStorage` runs once when the wizard saves; `toEditable`
// runs once when loading a preset/existing value back into the textarea.
export function toStorage(text: string): string {
  return text.replace(/\r\n|\r|\n/g, '<br>')
}

export function toEditable(text: string): string {
  return text.replace(/<br\s*\/?>/gi, '\n')
}
