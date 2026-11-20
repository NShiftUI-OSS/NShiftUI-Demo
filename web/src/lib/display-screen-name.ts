export function displayScreenName(name: string) {
  if (!name) return name
  return name.charAt(0).toLocaleUpperCase('pt-BR') + name.slice(1)
}
