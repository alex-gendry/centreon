import type { SelectEntry } from '@centreon/ui';

import { SortOrder } from '../../models';

import { Criteria, SearchType } from './models';
import { SearchableFields } from './searchQueryLanguage/models';

interface DefaultCriteriaValues {
  hostCategories?: Array<SelectEntry>;
  hostGroups?: Array<SelectEntry>;
  hostSeverities?: Array<SelectEntry>;
  hostSeverityLevels?: Array<SelectEntry>;
  information?: string;
  monitoringServers?: Array<SelectEntry>;
  resourceTypes?: Array<SelectEntry>;
  serviceCategories?: Array<SelectEntry>;
  serviceGroups?: Array<SelectEntry>;
  serviceSeverities?: Array<SelectEntry>;
  serviceSeverityLevels?: Array<SelectEntry>;
  states?: Array<SelectEntry>;
  statusTypes?: Array<SelectEntry>;
  statuses?: Array<SelectEntry>;
}

const defaultSortField = 'status_severity_code';
const defaultSortOrder = SortOrder.asc;

const getDefaultCriterias = (
  {
    resourceTypes = [],
    states = [],
    serviceSeverities = [],
    serviceSeverityLevels = [],
    hostSeverities = [],
    hostSeverityLevels = [],
    statuses = [],
    hostGroups = [],
    serviceGroups = [],
    monitoringServers = [],
    statusTypes = [],
    hostCategories = [],
    serviceCategories = []
  }: DefaultCriteriaValues = {
    hostCategories: [],
    hostGroups: [],
    hostSeverities: [],
    hostSeverityLevels: [],
    information: '',
    monitoringServers: [],
    resourceTypes: [],
    serviceCategories: [],
    serviceGroups: [],
    serviceSeverities: [],
    serviceSeverityLevels: [],
    states: [],
    statusTypes: [],
    statuses: []
  }
): Array<Criteria> => {
  return [
    {
      name: 'resource_types',
      object_type: null,
      search_data: {
        field: SearchableFields.name,
        id: 'resources_types',
        type: SearchType.lists,
        values: []
      },
      type: 'multi_select',
      value: resourceTypes
    },
    {
      name: 'states',
      object_type: null,
      search_data: null,
      type: 'multi_select',
      value: states
    },
    {
      name: 'statuses',
      object_type: null,
      search_data: null,
      type: 'multi_select',
      value: statuses
    },
    {
      name: 'status_types',
      object_type: null,
      search_data: null,
      type: 'multi_select',
      value: statusTypes
    },
    {
      name: 'host_groups',
      object_type: 'host_groups',
      search_data: null,
      type: 'multi_select',
      value: hostGroups
    },
    {
      name: 'service_groups',
      object_type: 'service_groups',
      search_data: null,
      type: 'multi_select',
      value: serviceGroups
    },
    {
      name: 'monitoring_servers',
      object_type: 'monitoring_servers',
      search_data: null,
      type: 'multi_select',
      value: monitoringServers
    },
    {
      name: 'host_categories',
      object_type: 'host_categories',
      search_data: null,
      type: 'multi_select',
      value: hostCategories
    },
    {
      name: 'service_categories',
      object_type: 'service_categories',
      search_data: null,
      type: 'multi_select',
      value: serviceCategories
    },
    {
      name: 'host_severities',
      object_type: 'host_severities',
      search_data: null,
      type: 'multi_select',
      value: hostSeverities
    },
    {
      name: 'host_severity_levels',
      object_type: 'host_severity_levels',
      search_data: null,
      type: 'multi_select',
      value: hostSeverityLevels
    },
    {
      name: 'service_severities',
      object_type: 'service_severities',
      search_data: null,
      type: 'multi_select',
      value: serviceSeverities
    },
    {
      name: 'service_severity_levels',
      object_type: 'service_severity_levels',
      search_data: null,
      type: 'multi_select',
      value: serviceSeverityLevels
    },
    {
      name: 'search',
      object_type: null,
      search_data: null,
      type: 'text',
      value: ''
    },
    {
      name: 'sort',
      object_type: null,
      search_data: null,
      type: 'array',
      value: [defaultSortField, defaultSortOrder]
    }
  ];
};

const getAllCriterias = (): Array<Criteria> => [
  ...getDefaultCriterias(),
  {
    name: 'monitoring_servers',
    object_type: 'monitoring_servers',
    type: 'multi_select',
    value: []
  }
];

export default getDefaultCriterias;
export { defaultSortField, defaultSortOrder, getAllCriterias };
