import { ReactNode } from 'react';

import { SelectEntry } from '@centreon/ui';

import { PanelConfiguration, WidgetOptions } from '../models';

export interface Widget {
  data: object | null;
  id: string | null;
  moduleName: string | null;
  options: WidgetOptions;
  panelConfiguration: PanelConfiguration | null;
}

export interface WidgetPropertyProps {
  className?: string;
  disabled?: boolean;
  disabledCondition?: (values: Widget) => boolean;
  endAdornment?: ReactNode;
  label: string;
  propertyName: string;
  required?: boolean;
  text?: {
    autoSize?: boolean;
    multiline?: boolean;
    size?: string;
    step?: string;
    type?: string;
  };
}

export interface WidgetDataResource {
  resourceType: 'host-group' | 'host-category' | 'host' | 'service';
  resources: Array<SelectEntry>;
}
export interface WidgetDataMetric {
  id: number;
  metrics: Array<SelectEntry>;
}

export interface NamedEntity {
  id: number;
  name: string;
}

export interface Metric extends NamedEntity {
  criticalHighThreshold: number | null;
  criticalLowThreshold: number | null;
  unit: string;
  warningHighThreshold: number | null;
  warningLowThreshold: number | null;
}

export interface ServiceMetric extends NamedEntity {
  metrics: Array<Metric>;
}

export enum WidgetResourceType {
  host = 'host',
  hostCategory = 'host-category',
  hostGroup = 'host-group',
  service = 'service',
  serviceCategory = 'service-category',
  serviceGroup = 'service-group'
}

export enum RadioOptions {
  custom = 'custom',
  default = 'default',
  manual = 'manual'
}
