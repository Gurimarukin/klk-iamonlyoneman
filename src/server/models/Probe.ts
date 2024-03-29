export type Probe = (url: string) => Promise<ProbeResponse>

export type ProbeResponse = {
  width: number
  height: number
  type: string
  mime: string
  wUnits: string
  hUnits: string
  length: number
  url: string
}
