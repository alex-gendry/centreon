/* eslint-disable typescript-sort-keys/interface */

import { JsonDecoder } from 'ts.data.json';

import { buildListingDecoder } from '@centreon/ui';

import {
  ContactType,
  Dashboard,
  DashboardAccessRightsContact,
  DashboardAccessRightsContactGroup,
  DashboardPanel,
  DashboardRole,
  DashboardsContact,
  DashboardsContactGroup,
  NamedEntity
} from './models';

const namedEntityDecoder = {
  id: JsonDecoder.number,
  name: JsonDecoder.string
};

/**
 * dashboard property : panel
 */

const dashboardPanelDecoder = JsonDecoder.object<DashboardPanel>(
  {
    ...namedEntityDecoder,
    layout: JsonDecoder.object<DashboardPanel['layout']>(
      {
        height: JsonDecoder.number,
        minHeight: JsonDecoder.number,
        minWidth: JsonDecoder.number,
        width: JsonDecoder.number,
        x: JsonDecoder.number,
        y: JsonDecoder.number
      },
      'Dashboard panel layout',
      {
        minHeight: 'min_height',
        minWidth: 'min_width'
      }
    ),
    widgetSettings: JsonDecoder.succeed,
    widgetType: JsonDecoder.string
  },
  'Dashboard panel',
  {
    widgetSettings: 'widget_settings',
    widgetType: 'widget_type'
  }
);

/**
 * dashboard entity
 */

export const dashboardEntityDecoder = {
  ...namedEntityDecoder,
  createdAt: JsonDecoder.string,
  createdBy: JsonDecoder.object<NamedEntity>(namedEntityDecoder, 'Created By'),
  description: JsonDecoder.nullable(JsonDecoder.string),
  ownRole: JsonDecoder.enumeration<DashboardRole>(
    DashboardRole,
    'Dashboard role'
  ),
  panels: JsonDecoder.optional(
    JsonDecoder.array(dashboardPanelDecoder, 'Panels')
  ),
  updatedAt: JsonDecoder.string,
  updatedBy: JsonDecoder.object<NamedEntity>(namedEntityDecoder, 'Updated By')
};

export const dashboardDecoder = JsonDecoder.object<Dashboard>(
  {
    ...dashboardEntityDecoder,
    refresh: JsonDecoder.object<Dashboard['refresh']>(
      {
        interval: JsonDecoder.nullable(JsonDecoder.number),
        type: JsonDecoder.enumeration<'global' | 'manual'>(
          ['global', 'manual'],
          'Refresh interval type'
        )
      },
      'Global refresh interval'
    )
  },
  'Dashboard',
  {
    createdAt: 'created_at',
    createdBy: 'created_by',
    ownRole: 'own_role',
    updatedAt: 'updated_at',
    updatedBy: 'updated_by'
  }
);

export const dashboardListDecoder = buildListingDecoder({
  entityDecoder: JsonDecoder.object<Omit<Dashboard, 'refresh'>>(
    dashboardEntityDecoder,
    'Dashboard',
    {
      createdAt: 'created_at',
      createdBy: 'created_by',
      ownRole: 'own_role',
      updatedAt: 'updated_at',
      updatedBy: 'updated_by'
    }
  ),
  entityDecoderName: 'Dashboard List',
  listingDecoderName: 'Dashboards'
});

/**
 * dashboards contacts
 */

export const dashboardsContactDecoder = JsonDecoder.object<DashboardsContact>(
  {
    id: JsonDecoder.number,
    name: JsonDecoder.string,
    type: JsonDecoder.constant(ContactType.contact)
  },
  'Dashboards Contact'
);

export const dashboardsContactsListDecoder = buildListingDecoder({
  entityDecoder: dashboardsContactDecoder,
  entityDecoderName: 'Dashboards Contacts List',
  listingDecoderName: 'Dashboards Contacts'
});

/**
 * dashboard contact groups
 */

export const dashboardsContactGroupDecoder =
  JsonDecoder.object<DashboardsContactGroup>(
    {
      id: JsonDecoder.number,
      name: JsonDecoder.string,
      type: JsonDecoder.constant(ContactType.contactGroup)
    },
    'Dashboards Contact Group'
  );

export const dashboardsContactGroupsListDecoder = buildListingDecoder({
  entityDecoder: dashboardsContactGroupDecoder,
  entityDecoderName: 'Dashboards Contact Groups List',
  listingDecoderName: 'Dashboards Contact Groups'
});

/**
 * dashboard access rights : entity
 */

export const dashboardAccessRightsContactDecoder =
  JsonDecoder.object<DashboardAccessRightsContact>(
    {
      email: JsonDecoder.optional(JsonDecoder.string),
      id: JsonDecoder.number,
      name: JsonDecoder.string,
      role: JsonDecoder.enumeration<DashboardRole>(
        DashboardRole,
        'DashboardRole'
      ),
      type: JsonDecoder.constant(ContactType.contact)
    },
    'Dashboard AccessRights Contact'
  );

export const dashboardAccessRightsContactListDecoder = buildListingDecoder({
  entityDecoder: dashboardAccessRightsContactDecoder,
  entityDecoderName: 'Dashboard AccessRights Contact',
  listingDecoderName: 'Dashboard AccessRights Contact List'
});

export const dashboardAccessRightsContactGroupDecoder =
  JsonDecoder.object<DashboardAccessRightsContactGroup>(
    {
      id: JsonDecoder.number,
      name: JsonDecoder.string,
      role: JsonDecoder.enumeration<DashboardRole>(
        DashboardRole,
        'DashboardRole'
      ),
      type: JsonDecoder.constant(ContactType.contactGroup)
    },
    'Dashboard AccessRights ContactGroup'
  );

export const dashboardAccessRightsContactGroupListDecoder = buildListingDecoder(
  {
    entityDecoder: dashboardAccessRightsContactGroupDecoder,
    entityDecoderName: 'Dashboard AccessRights ContactGroup',
    listingDecoderName: 'Dashboard AccessRights ContactGroup List'
  }
);
