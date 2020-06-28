export class MarkdownText {
  content = ''
  public get = () => this.content.trim()

  constructor(firstLine?: string) {
    if (firstLine) this.addLine(firstLine)
  }

  public addLine = (line: string) => {
    this.content += `${line}\n\n`
    return this
  }
}

export const markdownUrl = (title: string, url: string) => {
  return `[${title}](${url})`
}

export const collapsible = (input: string, title: string) => {
  return `<details>\n<summary>${title}</summary>\n\n${input}\n\n</details>`
}
