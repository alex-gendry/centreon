import {
  pipe,
  split,
  head,
  propOr,
  T,
  equals,
  insert,
  map,
  propEq,
  reject
} from 'ramda';
import { makeStyles } from 'tss-react/mui';

import { ColumnType } from '@centreon/ui';
import type { Column } from '@centreon/ui';
import { FeatureFlags } from '@centreon/ui-context';

import {
  labelResource,
  labelStatus,
  labelDuration,
  labelTries,
  labelInformation,
  labelState,
  labelLastCheck,
  labelParent,
  labelNotes,
  labelAction,
  labelGraph,
  labelAlias,
  labelFqdn,
  labelMonitoringServer,
  labelNotification,
  labelCheck,
  labelSeverity,
  labelParentAlias,
  labelService,
  labelHost,
  labelServices
} from '../../translatedLabels';
import truncate from '../../truncate';
import { Visualization } from '../../models';

import StateColumn from './State';
import GraphColumn from './Graph';
import NotesUrlColumn from './Url/Notes';
import ActionUrlColumn from './Url/Action';
import StatusColumn from './Status';
import SeverityColumn from './Severity';
import ResourceColumn from './Resource';
import ParentResourceColumn from './Parent';
import NotificationColumn from './Notification';
import ChecksColumn from './Checks';
import ParentAliasColumn from './ParentAlias';
import SubItem from './ServiceSubItemColumn/SubItem';

interface StyleProps {
  isHovered: boolean;
}

const useStyles = makeStyles<StyleProps>()((theme, { isHovered }) => ({
  extraSmallChip: {
    height: theme.spacing(1.25),
    lineHeight: theme.spacing(1.25),
    minWidth: theme.spacing(1.25)
  },
  resourceDetailsCell: {
    alignItems: 'center',
    display: 'flex',
    flexWrap: 'nowrap'
  },
  resourceNameItem: {
    lineHeight: 1,
    whiteSpace: 'nowrap'
  },
  resourceNameText: {
    color: isHovered
      ? theme.palette.text.primary
      : theme.palette.text.secondary,
    paddingLeft: theme.spacing(0.5)
  }
}));

export interface ColumnProps {
  actions;
  featureFlags?: FeatureFlags | null;
  t: (value: string) => string;
  visualization?: Visualization;
}

export const defaultSelectedColumnIds = [
  'status',
  'resource',
  'parent_resource',
  'graph',
  'duration',
  'last_check',
  'information',
  'tries'
];

export const defaultSelectedColumnIdsforViewByHost = [
  'resource',
  'services',
  'state',
  'graph',
  'duration',
  'last_check',
  'information',
  'tries'
];

export const getColumns = ({
  actions,
  visualization = Visualization.All,
  featureFlags,
  t
}: ColumnProps): Array<Column> => {
  const columns = [
    {
      Component: StatusColumn({ actions, t }),
      clickable: true,
      getRenderComponentOnRowUpdateCondition: T,
      hasHoverableComponent: true,
      id: 'status',
      label: t(labelStatus),
      rowMemoProps: ['status', 'severity_code', 'type'],
      sortField: 'status_severity_code',
      sortable: true,
      type: ColumnType.component,
      width: 'max-content'
    },
    {
      Component: ResourceColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'resource',
      label: t(labelResource),
      rowMemoProps: ['icon', 'short_type', 'name'],
      sortField: 'name',
      sortable: true,
      type: ColumnType.component,
      width: 'max-content'
    },
    {
      Component: ParentResourceColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'parent_resource',
      label: t(labelParent),
      rowMemoProps: ['parent'],
      sortField: 'parent_name',
      sortable: true,
      type: ColumnType.component,
      width: 'max-content'
    },
    {
      Component: GraphColumn({ onClick: actions.onDisplayGraph }),
      getRenderComponentOnRowUpdateCondition: T,
      id: 'graph',
      label: t(labelGraph),
      shortLabel: 'G',
      sortable: false,
      type: ColumnType.component
    },
    {
      getFormattedString: ({ duration }): string => duration,
      id: 'duration',
      label: t(labelDuration),
      sortField: 'last_status_change',
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      getFormattedString: ({ tries }): string => tries,
      id: 'tries',
      label: t(labelTries),
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      getFormattedString: ({ last_check }): string => last_check,
      id: 'last_check',
      label: t(labelLastCheck),
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      getFormattedString: pipe(
        propOr('', 'information'),
        split('\n'),
        head,
        truncate
      ) as (row) => string,
      id: 'information',
      label: t(labelInformation),
      rowMemoProps: ['information'],
      sortable: false,
      type: ColumnType.string,
      width: 'minmax(100px, 1fr)'
    },
    {
      Component: SeverityColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'severity',
      label: t(labelSeverity),
      rowMemoProps: ['severity_level'],
      shortLabel: 'S',
      sortField: 'severity_level',
      sortable: true,
      type: ColumnType.component
    },
    {
      Component: NotesUrlColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'notes_url',
      label: t(labelNotes),
      rowMemoProps: ['links'],
      shortLabel: 'N',
      sortable: false,
      type: ColumnType.component
    },
    {
      Component: ActionUrlColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'action_url',
      label: t(labelAction),
      rowMemoProps: ['links'],
      shortLabel: 'A',
      sortable: false,
      type: ColumnType.component
    },
    {
      Component: StateColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'state',
      label: t(labelState),
      rowMemoProps: ['is_in_downtime', 'is_acknowledged', 'name', 'links'],
      sortable: false,
      type: ColumnType.component,
      width: 'max-content'
    },
    {
      getFormattedString: ({ alias }): string => alias,
      id: 'alias',
      label: t(labelAlias),
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      Component: ParentAliasColumn,
      getFormattedString: ({ parent }): string => parent?.alias,
      id: 'parent_alias',
      label: t(labelParentAlias),
      rowMemoProps: ['parent'],
      sortField: 'parent_alias',
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      getFormattedString: ({ fqdn }): string => fqdn,
      id: 'fqdn',
      label: t(labelFqdn),
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    {
      getFormattedString: ({ monitoring_server_name }): string =>
        monitoring_server_name,
      id: 'monitoring_server_name',
      label: t(labelMonitoringServer),
      sortable: true,
      type: ColumnType.string,
      width: 'max-content'
    },
    ...(featureFlags?.notification
      ? []
      : [
          {
            Component: NotificationColumn,
            getRenderComponentOnRowUpdateCondition: T,
            id: 'notification',
            label: t(labelNotification),
            rowMemoProps: ['is_notification_enabled'],
            shortLabel: 'Notif',
            type: ColumnType.component
          }
        ]),
    {
      Component: ChecksColumn,
      getRenderComponentOnRowUpdateCondition: T,
      id: 'checks',
      label: t(labelCheck),
      rowMemoProps: ['has_passive_checks_enabled', 'has_active_checks_enabled'],
      shortLabel: 'C',
      type: ColumnType.component
    }
  ];

  if (equals(visualization, Visualization.Service)) {
    const changeResourceLabel = (column: Column): Column =>
      equals(column.label, labelResource)
        ? { ...column, label: t(labelService) }
        : column;

    const changeParentLabel = (column: Column): Column =>
      equals(column.label, labelParent)
        ? { ...column, label: t(labelHost) }
        : column;

    const columnsForVisualizationByService = pipe(
      map(changeResourceLabel),
      map(changeParentLabel)
    )(columns);

    return columnsForVisualizationByService;
  }

  if (equals(visualization, Visualization.Host)) {
    const subItemColumn = {
      Component: SubItem,
      displaySubItemsCaret: true,
      id: 'services',
      label: t(labelServices),
      type: ColumnType.component,
      width: 'max-content'
    };

    const changeResourceLabel = (column: Column): Column =>
      equals(column.label, labelResource)
        ? { ...column, label: t(labelHost) }
        : column;

    const columnsForVisualizationByHost = pipe(
      reject(propEq('id', 'status')),
      reject(propEq('id', 'parent_resource')),
      reject(propEq('id', 'parent_alias')),
      insert(1, subItemColumn),
      map(changeResourceLabel)
    )(columns) as Array<Column>;

    return columnsForVisualizationByHost;
  }

  return columns;
};

export { useStyles as useColumnStyles };
