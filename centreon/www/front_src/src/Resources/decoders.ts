import { JsonDecoder } from 'ts.data.json';

import {
  Icon,
  Notes,
  Parent,
  Resource,
  ResourceEndpoints,
  ResourceExternals,
  ResourceLinks,
  ResourceShortType,
  ResourceType,
  ResourceUris,
  Status,
  Severity
} from './models';

const statusDecoder = JsonDecoder.object<Status>(
  {
    name: JsonDecoder.string,
    severity_code: JsonDecoder.number
  },
  'Status'
);

const severityIcon = JsonDecoder.object<Icon>(
  {
    id: JsonDecoder.number,
    name: JsonDecoder.string,
    url: JsonDecoder.string
  },
  'SeverityIcon'
);

const severityDecoder = JsonDecoder.object<Severity>(
  {
    icon: severityIcon,
    id: JsonDecoder.number,
    level: JsonDecoder.number,
    name: JsonDecoder.string,
    type: JsonDecoder.string
  },
  'Severity'
);

const commonDecoders = {
  duration: JsonDecoder.optional(JsonDecoder.string),
  has_active_checks_enabled: JsonDecoder.optional(JsonDecoder.boolean),
  has_passive_checks_enabled: JsonDecoder.optional(JsonDecoder.boolean),
  icon: JsonDecoder.optional(
    JsonDecoder.object<Icon>(
      {
        id: JsonDecoder.optional(JsonDecoder.number),
        name: JsonDecoder.string,
        url: JsonDecoder.string
      },
      'ResourceIcon'
    )
  ),
  id: JsonDecoder.number,
  information: JsonDecoder.optional(JsonDecoder.string),
  is_acknowledged: JsonDecoder.optional(JsonDecoder.boolean),

  is_in_downtime: JsonDecoder.optional(JsonDecoder.boolean),
  is_notification_enabled: JsonDecoder.optional(JsonDecoder.boolean),
  last_check: JsonDecoder.optional(JsonDecoder.string),
  links: JsonDecoder.optional(
    JsonDecoder.object<ResourceLinks>(
      {
        endpoints: JsonDecoder.object<ResourceEndpoints>(
          {
            acknowledgement: JsonDecoder.optional(JsonDecoder.string),
            check: JsonDecoder.optional(JsonDecoder.string),
            details: JsonDecoder.optional(JsonDecoder.string),
            downtime: JsonDecoder.optional(JsonDecoder.string),
            forced_check: JsonDecoder.optional(JsonDecoder.string),
            metrics: JsonDecoder.optional(JsonDecoder.string),
            performance_graph: JsonDecoder.optional(JsonDecoder.string),
            sensitivity: JsonDecoder.optional(JsonDecoder.string),
            status_graph: JsonDecoder.optional(JsonDecoder.string),
            timeline: JsonDecoder.optional(JsonDecoder.string),
            timeline_download: JsonDecoder.optional(JsonDecoder.string)
          },
          'ResourceLinksEndpoints'
        ),
        externals: JsonDecoder.object<ResourceExternals>(
          {
            action_url: JsonDecoder.optional(JsonDecoder.string),
            notes: JsonDecoder.optional(
              JsonDecoder.object<Notes>(
                {
                  label: JsonDecoder.optional(JsonDecoder.string),
                  url: JsonDecoder.string
                },
                'ResourceLinksExternalNotes'
              )
            )
          },
          'ResourceLinksExternals'
        ),
        uris: JsonDecoder.object<ResourceUris>(
          {
            configuration: JsonDecoder.optional(JsonDecoder.string),
            logs: JsonDecoder.optional(JsonDecoder.string),
            reporting: JsonDecoder.optional(JsonDecoder.string)
          },
          'ResourceLinksUris'
        )
      },
      'ResourceLinks'
    )
  ),
  name: JsonDecoder.string,
  service_id: JsonDecoder.optional(JsonDecoder.number),
  severity: JsonDecoder.optional(severityDecoder),
  severity_level: JsonDecoder.optional(JsonDecoder.number),
  short_type: JsonDecoder.oneOf<ResourceShortType>(
    [
      JsonDecoder.isExactly('h'),
      JsonDecoder.isExactly('m'),
      JsonDecoder.isExactly('s'),
      JsonDecoder.isExactly('a')
    ],
    'ResourceShortType'
  ),
  status: JsonDecoder.optional(statusDecoder),
  tries: JsonDecoder.optional(JsonDecoder.string),
  type: JsonDecoder.enumeration<ResourceType>(ResourceType, 'ResourceType'),
  uuid: JsonDecoder.string
};

const resourceDecoder = JsonDecoder.object<Resource>(
  {
    ...commonDecoders,
    parent: JsonDecoder.optional(
      JsonDecoder.object<Parent>(commonDecoders, 'ResourceParent')
    )
  },
  'Resource'
);

export { statusDecoder, resourceDecoder };
