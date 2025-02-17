/* eslint-disable @typescript-eslint/no-unused-expressions */
import { renderHook } from '@testing-library/react-hooks/dom';
import { useAtomValue } from 'jotai';
import * as Ramda from 'ramda';
import { equals, isEmpty } from 'ramda';

import { Method, TestQueryProvider, getFoundFields } from '@centreon/ui';
import { userAtom } from '@centreon/ui-context';

import { labelPoller } from '../../Header/Poller/translatedLabels';
import useListing from '../Listing/useListing';
import useLoadResources from '../Listing/useLoadResources';
import { Search } from '../Listing/useLoadResources/models';
import {
  EndpointParams,
  defaultStatuses,
  getListingEndpoint,
  searchableFields
} from '../testUtils';
import {
  labelAcknowledged,
  labelAll,
  labelAllAlerts,
  labelHostCategory,
  labelHostGroup,
  labelHostSeverity,
  labelOk,
  labelSearch,
  labelSearchOptions,
  labelServiceGroup,
  labelState,
  labelStateFilter,
  labelStatus,
  labelUp
} from '../translatedLabels';

import { BasicCriteriaResourceType } from './criteriasNewInterface/model';
import { advancedModeLabel } from './criteriasNewInterface/translatedLabels';
import useFilter from './useFilter';

import Filter from '.';

const getSearch = (searchedValue?: string): Search | undefined => {
  if (!searchedValue) {
    return undefined;
  }

  const fieldMatches = getFoundFields({
    fields: searchableFields,
    value: searchedValue
  });

  if (!isEmpty(fieldMatches)) {
    const matches = fieldMatches.map((item) => {
      return { field: item.field, values: item.value?.split(',') };
    });

    return {
      lists: matches.filter((item) => item.values)
    };
  }

  return {
    regex: {
      fields: searchableFields,
      value: searchedValue
    }
  };
};

const emptyListData = {
  meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 0 },
  result: []
};
const resourcesByHostType = {
  acknowledged: false,
  active_checks: true,
  alias: 'SensorProbe-Datacenter-04',
  chart_url: null,
  duration: '5m 23s',
  fqdn: 'SensorProbe-Datacenter-04',
  host_id: 143,
  icon: {
    name: 'climate_64',
    url: '/centreon/img/media/Hardware/climate_64.png'
  },
  id: 143,
  in_downtime: false,
  information: 'OK - SensorProbe-Datacenter-04: rta 0.873ms, lost 0%',
  last_check: '2m 26s',
  last_status_change: '2023-10-11T17:05:57+02:00',
  links: {
    endpoints: {
      acknowledgement:
        '/centreon/api/latest/monitoring/hosts/143/acknowledgements?limit=1',
      details: '/centreon/api/latest/monitoring/resources/hosts/143',
      downtime:
        '/centreon/api/latest/monitoring/hosts/143/downtimes?search=%7B%22%24and%22:%5B%7B%22start_time%22:%7B%22%24lt%22:1697037080%7D,%22end_time%22:%7B%22%24gt%22:1697037080%7D,%220%22:%7B%22%24or%22:%7B%22is_cancelled%22:%7B%22%24neq%22:1%7D,%22deletion_time%22:%7B%22%24gt%22:1697037080%7D%7D%7D%7D%5D%7D',
      notification_policy: null,
      performance_graph: null,
      status_graph: null,
      timeline: '/centreon/api/latest/monitoring/hosts/143/timeline'
    },
    externals: {
      action_url: '',
      notes: {
        label: '',
        url: ''
      }
    },
    uris: {
      configuration: '/centreon/main.php?p=60101&o=c&host_id=143',
      logs: '/centreon/main.php?p=20301&h=143',
      reporting: '/centreon/main.php?p=307&host=143'
    }
  },
  monitoring_server_name: 'Central',
  name: 'SensorProbe-Datacenter-04',
  notification_enabled: false,
  parent: null,
  passive_checks: false,
  performance_data: null,
  service_id: null,
  severity: null,
  short_type: 'h',
  status: {
    code: 0,
    name: 'UP',
    severity_code: 5
  },
  tries: '1/5 (H)',
  type: 'host',
  uuid: 'h143'
};

const resourcesByServiceType = {
  acknowledged: false,
  active_checks: true,
  alias: null,
  chart_url: null,
  duration: '10s',
  fqdn: null,
  host_id: 113,
  icon: null,
  id: 863,
  in_downtime: false,
  information: 'Nombre de connexion : 150',
  last_check: '10s',
  last_status_change: '2023-10-11T17:14:55+02:00',
  links: {
    endpoints: {
      acknowledgement:
        '/centreon/api/latest/monitoring/hosts/113/services/863/acknowledgements?limit=1',
      details:
        '/centreon/api/latest/monitoring/resources/hosts/113/services/863',
      downtime:
        '/centreon/api/latest/monitoring/hosts/113/services/863/downtimes?search=%7B%22%24and%22:%5B%7B%22start_time%22:%7B%22%24lt%22:1697037305%7D,%22end_time%22:%7B%22%24gt%22:1697037305%7D,%220%22:%7B%22%24or%22:%7B%22is_cancelled%22:%7B%22%24neq%22:1%7D,%22deletion_time%22:%7B%22%24gt%22:1697037305%7D%7D%7D%7D%5D%7D',
      notification_policy: null,
      performance_graph:
        '/centreon/api/latest/monitoring/hosts/113/services/863/metrics/performance',
      status_graph:
        '/centreon/api/latest/monitoring/hosts/113/services/863/metrics/status',
      timeline:
        '/centreon/api/latest/monitoring/hosts/113/services/863/timeline'
    },
    externals: {
      action_url: '',
      notes: {
        label: '',
        url: ''
      }
    },
    uris: {
      configuration: '/centreon/main.php?p=60201&o=c&service_id=863',
      logs: '/centreon/main.php?p=20301&svc=113_863',
      reporting:
        '/centreon/main.php?p=30702&period=yesterday&start=&end=&host_id=113&item=863'
    }
  },
  monitoring_server_name: 'Central',
  name: 'nbr-connect',
  notification_enabled: false,
  parent: {
    alias: 'fw-sydney',
    fqdn: 'fw-sydney',
    host_id: null,
    icon: null,
    id: 113,
    links: {
      endpoints: {
        acknowledgement: null,
        details: null,
        downtime: null,
        notification_policy: null,
        performance_graph: null,
        status_graph: null,
        timeline: null
      },
      externals: {
        action_url: null,
        notes: null
      },
      uris: {
        configuration: null,
        logs: null,
        reporting: null
      }
    },
    name: 'fw-sydney',
    service_id: null,
    short_type: 'h',
    status: {
      code: 0,
      name: 'UP',
      severity_code: 5
    },
    type: 'host',
    uuid: 'h113'
  },
  passive_checks: false,
  performance_data: null,
  service_id: 863,
  severity: null,
  short_type: 's',
  status: {
    code: 0,
    name: 'OK',
    severity_code: 5
  },
  tries: '2/3 (S)',
  type: 'service',
  uuid: 'h113-s863'
};

const pollersData = {
  address: null,
  description: null,
  id: 1,
  is_running: true,
  last_alive: 1697038658,
  name: 'Central',
  version: '23.10.0'
};
const hostCategoryData = {
  id: 3,
  name: 'Europe'
};

const hostSeverityData = {
  icon: {
    id: 82,
    name: 'flag_red',
    url: 'Criticity/flag_red.png'
  },
  id: 8,
  level: 1,
  name: 'Priority_1',
  type: 'host'
};

const linuxServersHostGroup = {
  id: 0,
  name: 'Linux-servers'
};

const FirewallHostGroup = {
  id: 1,
  name: 'Firewall'
};

const webAccessServiceGroup = {
  id: 0,
  name: 'Web-access'
};

enum Type {
  checkbox = 'checkbox',
  select = 'select',
  text = 'text'
}

const BasicCriteriasParams = [
  [
    'Basic criterias',
    [
      {
        criteria: BasicCriteriaResourceType.host,
        endpointParam: {
          resourceTypes: ['host'],
          search: getSearch(`name:${resourcesByHostType.name}`)
        },
        requestToWait: '@GetResourcesByHostType',
        type: Type.select,
        value: resourcesByHostType.name
      },
      {
        criteria: BasicCriteriaResourceType.service,
        endpointParam: {
          resourceTypes: ['service'],
          search: getSearch(`name:${resourcesByServiceType.name}`)
        },
        requestToWait: '@GetResourcesByServiceType',
        type: Type.select,
        value: resourcesByServiceType.name
      },
      {
        criteria: labelState,
        endpointParam: { states: ['acknowledged'] },
        type: Type.checkbox,
        value: labelAcknowledged
      },
      {
        criteria: labelStatus,
        endpointParam: { statuses: ['OK'] },
        type: Type.checkbox,
        value: labelOk
      },
      {
        criteria: labelStatus,
        endpointParam: { statuses: ['Up'] },
        type: Type.checkbox,
        value: labelUp
      },
      {
        criteria: labelHostGroup,
        endpointParam: { hostGroups: [linuxServersHostGroup.name] },
        requestToWait: '@hostgroupsRequest',
        type: Type.select,
        value: linuxServersHostGroup.name
      },
      {
        criteria: labelServiceGroup,
        endpointParam: { serviceGroups: [webAccessServiceGroup.name] },
        requestToWait: '@serviceGroupsRequest',
        type: Type.select,
        value: webAccessServiceGroup.name
      },
      {
        criteria: labelPoller,
        endpointParam: { monitoringServers: [pollersData.name] },
        requestToWait: '@pollersRequest',
        type: Type.select,
        value: pollersData.name
      }
    ]
  ],
  [
    'Extended criterias',
    [
      {
        criteria: labelHostCategory,
        endpointParam: { hostCategories: [hostCategoryData.name] },
        requestToWait: '@hostCategoryRequest',
        type: Type.select,
        value: hostCategoryData.name
      },
      {
        criteria: labelHostSeverity,
        endpointParam: { hostSeverities: [hostSeverityData.name] },
        requestToWait: '@hostSeverityRequest',
        type: Type.select,
        value: hostSeverityData.name
      }
    ]
  ]
];

const customFilters = [
  [
    labelAll,
    {
      resourceTypes: [],
      states: [],
      statusTypes: [],
      statuses: []
    }
  ],
  [
    labelAllAlerts,
    {
      resourceTypes: [],
      states: [],
      statusTypes: [],
      statuses: defaultStatuses
    }
  ]
];

interface Query {
  name: string;
  value: string;
}
interface Request {
  criteria: string;
  endpointParam: unknown;
  query?: Query;
  searchValue?: string;
}

const prepareRequest = ({
  searchValue,
  endpointParam,
  criteria,
  query
}: Request): void => {
  const endpoint = getListingEndpoint({
    resourceTypes: [],
    search: searchValue ? getSearch(searchValue) : undefined,
    states: [],
    statusTypes: [],
    statuses: [],
    ...endpointParam
  });
  const body = {
    alias: `request/${criteria}`,
    method: Method.GET,
    path: endpoint
  };

  cy.interceptAPIRequest(query ? { ...body, query } : body);
};

const FilterWithLoading = (): JSX.Element => {
  useLoadResources();

  return <Filter />;
};

const FilterTest = (): JSX.Element | null => {
  useFilter();
  useListing();

  return <FilterWithLoading />;
};

const FilterWithProvider = (): JSX.Element => (
  <TestQueryProvider>
    <FilterTest />
  </TestQueryProvider>
);

before(() => {
  const userData = renderHook(() => useAtomValue(userAtom));

  userData.result.current.timezone = 'Europe/Paris';
  userData.result.current.locale = 'en_US';
});

describe('Filter', () => {
  beforeEach(() => {
    cy.interceptAPIRequest({
      alias: 'filterRequest',
      method: Method.GET,
      path: '**/events-view*',
      response: emptyListData
    });

    const DefaultEndpoint = getListingEndpoint({});

    cy.interceptAPIRequest({
      alias: `defaultRequest`,
      method: Method.GET,
      path: Ramda.replace('./api/latest/monitoring', '**', DefaultEndpoint),
      response: emptyListData
    });

    const searchValue = 'foobar';

    const endpointWithSearchValue = getListingEndpoint({
      resourceTypes: [],
      search: getSearch(searchValue),
      states: [],
      statusTypes: [],
      statuses: []
    });

    cy.interceptAPIRequest({
      alias: `getListRequest`,
      method: Method.GET,
      path: Ramda.replace(
        './api/latest/monitoring',
        '**',
        endpointWithSearchValue
      ),
      response: emptyListData
    });

    searchableFields.forEach((searchableField) => {
      const search = 'foobar';
      const fieldSearchValue = `${searchableField}:${search}`;
      const endpoint = getListingEndpoint({
        resourceTypes: [],
        search: getSearch(fieldSearchValue),
        states: [],
        statusTypes: [],
        statuses: []
      });
      cy.interceptAPIRequest({
        alias: `request/${searchableField}`,
        method: Method.GET,
        path: Ramda.replace('./api/latest/monitoring', '**', endpoint)
      });
    });

    cy.mount({
      Component: <FilterWithProvider />
    });

    cy.viewport(1200, 1000);
  });

  it('executes a listing request with "Unhandled alerts" filter by default', () => {
    cy.waitForRequest('@defaultRequest');

    cy.makeSnapshot();
  });

  searchableFields.forEach((searchableField) => {
    it(`executes a listing request with an "$and" search param containing ${searchableField} when ${searchableField} is typed in the search field`, () => {
      cy.waitForRequest('@filterRequest');

      const search = 'foobar';
      const fieldSearchValue = `${searchableField}:${search}`;

      cy.findByPlaceholderText(labelSearch).clear();
      cy.findByPlaceholderText(labelSearch).type(fieldSearchValue);
      cy.findByLabelText(labelSearchOptions).click();
      cy.findByText(labelSearch).click();

      cy.waitForRequest(`@request/${searchableField}`);

      cy.makeSnapshot();
    });
  });

  it('executes a listing request with an "$or" search param containing all searchable fields when a string that does not correspond to any searchable field is typed in the search field', () => {
    const searchValue = 'foobar';

    const searchableFieldExpressions = searchableFields.map(
      (searchableField) => `{"${searchableField}":{"$rg":"${searchValue}"}}`
    );

    cy.findByPlaceholderText(labelSearch).clear();

    cy.findByPlaceholderText(labelSearch).type(searchValue);

    cy.findByLabelText(labelSearchOptions).click();

    cy.findByText(labelSearch).click();

    cy.waitForRequest('@getListRequest').then(({ request }) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(
        Ramda.includes(
          `search={"$or":[${searchableFieldExpressions}]}`,
          decodeURIComponent(request.url.search)
        )
      ).to.be.true;
    });

    cy.makeSnapshot();
  });
});

describe('Custom filters', () => {
  beforeEach(() => {
    cy.interceptAPIRequest({
      alias: 'filterRequest',
      method: Method.GET,
      path: '**/events-view*',
      response: emptyListData
    });

    customFilters.forEach(([filterGroup, criterias]) => {
      const endpoint = getListingEndpoint(criterias as EndpointParams);

      cy.interceptAPIRequest({
        alias: `request/${filterGroup}`,
        method: Method.GET,
        path: Ramda.replace('./api/latest/monitoring', '**', endpoint)
      });
    });

    cy.mount({
      Component: <FilterWithProvider />
    });

    cy.viewport(1200, 1000);
  });

  customFilters.forEach(([filterGroup, criterias]) => {
    it(`executes a listing request with ${filterGroup} parameters when ${JSON.stringify(
      criterias
    )} filter is set`, () => {
      cy.waitForRequest('@filterRequest');

      cy.findByLabelText(labelStateFilter).click();

      cy.findByText(filterGroup).click();

      cy.waitForRequest(`@request/${filterGroup}`);
      cy.makeSnapshot();
    });
  });
});

describe.only('Criterias', () => {
  beforeEach(() => {
    cy.interceptAPIRequest({
      alias: 'filterRequest',
      method: Method.GET,
      path: '**/events-view*',
      response: emptyListData
    });

    const endpointByHostType = getListingEndpoint({
      limit: 10,
      resourceTypes: ['host'],
      sort: {},
      states: [],
      statusTypes: [],
      statuses: []
    });
    cy.interceptAPIRequest({
      alias: 'GetResourcesByHostType',
      method: Method.GET,
      path: endpointByHostType,
      query: {
        name: 'types',
        value: '["host"]'
      },
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [resourcesByHostType]
      }
    });

    const endpointByServiceType = getListingEndpoint({
      limit: 10,
      resourceTypes: ['service'],
      sort: {},
      states: [],
      statusTypes: [],
      statuses: []
    });

    cy.interceptAPIRequest({
      alias: 'GetResourcesByServiceType',
      method: Method.GET,
      path: endpointByServiceType,
      query: {
        name: 'types',
        value: '["service"]'
      },
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [resourcesByServiceType]
      }
    });

    cy.interceptAPIRequest({
      alias: 'pollersRequest',
      method: Method.GET,
      path: '**/monitoring/servers?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [pollersData]
      }
    });

    cy.interceptAPIRequest({
      alias: 'hostgroupsRequest',
      method: Method.GET,
      path: '**/hostgroups?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [linuxServersHostGroup]
      }
    });

    cy.interceptAPIRequest({
      alias: 'serviceGroupsRequest',
      method: Method.GET,
      path: '**/servicegroups?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [webAccessServiceGroup]
      }
    });
    cy.interceptAPIRequest({
      alias: 'hostCategoryRequest',
      method: Method.GET,
      path: '**/monitoring/hosts/categories?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [hostCategoryData]
      }
    });

    cy.interceptAPIRequest({
      alias: 'hostSeverityRequest',
      method: Method.GET,
      path: '**/monitoring/severities/host?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [hostSeverityData]
      }
    });

    cy.mount({
      Component: <FilterWithProvider />
    });

    cy.viewport(1200, 1000);
  });

  it(` Basic criterias interface`, () => {
    cy.findByPlaceholderText(labelSearch).clear();
    cy.findByLabelText(labelSearchOptions).click();

    cy.makeSnapshot();
  });
  it(`Extended criterias interface`, () => {
    cy.findByPlaceholderText(labelSearch).clear();
    cy.findByLabelText(labelSearchOptions).click();

    cy.findByText(advancedModeLabel).click();
    cy.makeSnapshot();
  });

  BasicCriteriasParams.forEach(([label, data]) => {
    const searchValue = 'foobar';

    data.forEach((element) => {
      const { criteria, value, type, endpointParam, requestToWait } = element;

      it(`executes a listing request with current search and selected ${criteria} criteria value when ${label} has changed`, () => {
        cy.findByPlaceholderText(labelSearch).clear();
        cy.findByPlaceholderText(labelSearch).type(searchValue);
        cy.get('[data-testid="Filter options"]').click();

        if (equals(label, 'Extended criterias')) {
          cy.findByText(advancedModeLabel).click();
        }

        if (equals(type, Type.select)) {
          cy.findByLabelText(criteria).click();
          cy.waitForRequest(requestToWait);
          cy.findByText(value).click();
          prepareRequest({ criteria, endpointParam, searchValue });
          cy.findByText(labelSearch).click();
          cy.waitForRequest(`@request/${criteria}`);

          cy.makeSnapshot();

          return;
        }
        if (equals(type, Type.checkbox)) {
          cy.findByText(value).click();
          prepareRequest({ criteria, endpointParam, searchValue });
          cy.findByText(labelSearch).click();
          cy.waitForRequest(`@request/${criteria}`);
          cy.makeSnapshot();
          cy.findByText(value).click();
        }
      });
    });
  });
});

describe('Keyboard actions', () => {
  beforeEach(() => {
    cy.interceptAPIRequest({
      alias: 'filterRequest',
      method: Method.GET,
      path: '**/events-view*',
      response: emptyListData
    });

    cy.interceptAPIRequest({
      alias: 'hostgroupsRequest',
      method: Method.GET,
      path: '**/hostgroups?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [linuxServersHostGroup, FirewallHostGroup]
      }
    });

    cy.interceptAPIRequest({
      alias: 'serviceGroupsRequest',
      method: Method.GET,
      path: '**/servicegroups?*',
      response: {
        meta: { limit: 10, page: 1, search: {}, sort_by: {}, total: 1 },
        result: [webAccessServiceGroup]
      }
    });

    cy.mount({
      Component: <FilterWithProvider />
    });

    cy.viewport(1200, 1000);
  });

  it('accepts the selected autocomplete suggestion when the beginning of a criteria is input and the "enter" key is pressed', () => {
    const searchBar = cy.findByPlaceholderText(labelSearch);

    searchBar.clear();

    searchBar.type('stat').type('{enter}');
    searchBar.should('have.value', 'state:');

    searchBar.type('u').type('{enter}');

    searchBar.should('have.value', 'state:unhandled');

    searchBar.type(' st').type('{enter}');

    searchBar.should('have.value', 'state:unhandled status:');

    searchBar.type(' type:');
    searchBar.type('{downArrow}').type('{enter}');

    searchBar.should('have.value', 'state:unhandled status: type:service');

    cy.makeSnapshot();
  });

  it(`accepts the selected autocomplete suggestion when the beginning of a dynamic criteria is input and the "enter" key is pressed`, () => {
    const searchBar = cy.findByPlaceholderText(labelSearch);

    searchBar.clear();
    searchBar.type('host');
    searchBar.type('{Enter}');
    searchBar.should('have.value', 'host_group:');
    searchBar.type('ESX');
    cy.findByText(linuxServersHostGroup.name).should('exist');
    searchBar.type('{Enter}');
    cy.findByPlaceholderText(labelSearch).should(
      'have.value',
      `host_group:${linuxServersHostGroup.name}`
    );

    searchBar.type(',');
    cy.findByText('Firewall').should('exist');
    searchBar.type('{downArrow}');
    searchBar.type('{Enter}');
    cy.waitForRequest('@hostgroupsRequest');

    cy.makeSnapshot();
  });
});
