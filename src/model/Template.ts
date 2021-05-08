class Template {
  name : string;
  description : string;
  repository : string;

  constructor ({name, description, repository} : TemplateParameters) {
    this.name        = name;
    this.description = description;
    this.repository  = repository;
  }
}

export interface TemplateParameters {
  name        : string;
  description : string;
  repository  : string;
}

export default Template;