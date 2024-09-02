import type { Schema, Attribute } from '@strapi/strapi';

export interface ValuesPlatformValues extends Schema.Component {
  collectionName: 'components_values_platform_values';
  info: {
    displayName: 'Platform_values';
  };
  attributes: {
    option: Attribute.String;
    value: Attribute.String;
  };
}

export interface ValuesFontValues extends Schema.Component {
  collectionName: 'components_values_font_values';
  info: {
    displayName: 'Font_values';
  };
  attributes: {
    font_name: Attribute.String;
    font_family: Attribute.String;
    font_link: Attribute.String;
    price: Attribute.Decimal;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'values.platform-values': ValuesPlatformValues;
      'values.font-values': ValuesFontValues;
    }
  }
}
