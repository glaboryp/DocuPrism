export interface StoredAnalysis {
  id: string
  timestamp: number
  inputText: string
  summary: string
  options: {
    type: string
    format: string
    length: string
  }
}
