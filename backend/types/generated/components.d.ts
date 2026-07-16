import type { Schema, Struct } from '@strapi/strapi';

export interface ProfileCertification extends Struct.ComponentSchema {
  collectionName: 'components_profile_certifications';
  info: {
    displayName: 'Certification';
    icon: 'award';
  };
  attributes: {
    credential_url: Schema.Attribute.String;
    expiry_date: Schema.Attribute.Date;
    issue_date: Schema.Attribute.Date;
    issuing_body: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'profile.certification': ProfileCertification;
    }
  }
}
