class Template {
  name : string;
  description : string;
  repository : string;

  constructor ({name, description, repository} : TemplateValues) {
    this.name        = name;
    this.description = description;
    this.repository  = repository;
  }
}

export interface TemplateValues {
  name        : string;
  description : string;
  repository  : string;
}

export default Template;