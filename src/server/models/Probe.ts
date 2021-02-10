export type Probe = (url: string) => Promise<ProbeResponse>

export type ProbeResponse = {
  readonly width: number
  readonly height: number
  readonly type: string
  readonly mime: string
  readonly wUnits: string
  readonly hUnits: string
  readonly length: number
  readonly url: string
}
