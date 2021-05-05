export interface ProjectConfig {
  dowJsonVersion : string,
  templatesRepository : string
}

export interface Template {
  name : string,
  description ?: string,
  repository ?: string
}