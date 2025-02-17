import { and, isEmpty, isNil, or } from 'ramda';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';
import { useAtomValue } from 'jotai';
import { ObjectShape } from 'yup/lib/object';

import {
  labelRequired,
  labelChooseAtLeastOneResource,
  labelChooseAtleastOneContactOrContactGroup,
  labelMessageFieldShouldNotBeEmpty,
  labelThisNameAlreadyExists
} from '../../translatedLabels';
import { notificationsNamesAtom } from '../../atom';
import { emptyEmail } from '../utils';
import { editedNotificationIdAtom } from '../atom';

interface UseValidationSchemaState {
  validationSchema: Yup.ObjectSchema<ObjectShape>;
}

const useValidationSchema = ({
  isBamModuleInstalled
}: {
  isBamModuleInstalled?: boolean;
}): UseValidationSchemaState => {
  const { t } = useTranslation();
  const notificationsNames = useAtomValue(notificationsNamesAtom);
  const notificationId = useAtomValue(editedNotificationIdAtom);

  const names = notificationsNames
    .filter((item) => item.id !== notificationId)
    .map((item) => item.name);

  const validateName = Yup.string()
    .required(t(labelRequired) as string)
    .notOneOf(names, t(labelThisNameAlreadyExists) as string);

  const messagesSchema = Yup.object({
    message: Yup.string().notOneOf(
      [emptyEmail],
      t(labelMessageFieldShouldNotBeEmpty) as string
    ),
    subject: Yup.string().required(t(labelRequired) as string)
  });

  const resourceSchema = (
    dependency1,
    dependency2
  ): Yup.ObjectSchema<ObjectShape> =>
    Yup.object().when([dependency1, dependency2], {
      is: (value1, value2) =>
        and(
          or(isNil(value1), isEmpty(value1)),
          or(isNil(value2), isEmpty(value2))
        ),
      otherwise: Yup.object().shape({
        ids: Yup.array()
      }),
      then: Yup.object().shape({
        ids: Yup.array().min(1, t(labelChooseAtLeastOneResource) as string)
      })
    });

  const contactsSchema = (dependency): Yup.ArraySchema<Yup.AnySchema> =>
    Yup.array().when(dependency, {
      is: (value) => isEmpty(value),
      otherwise: Yup.array(),
      then: Yup.array().min(
        1,
        t(labelChooseAtleastOneContactOrContactGroup) as string
      )
    });

  const validationSchema = Yup.object().shape(
    {
      contactgroups: contactsSchema('users'),
      hostGroups: resourceSchema('serviceGroups.ids', 'businessviews.ids'),
      messages: messagesSchema,
      name: validateName,
      serviceGroups: resourceSchema('hostGroups.ids', 'businessviews.ids'),
      users: contactsSchema('contactgroups'),
      ...(isBamModuleInstalled
        ? {
            businessviews: resourceSchema('hostGroups.ids', 'serviceGroups.ids')
          }
        : {})
    },
    [
      ['users', 'contactgroups'],
      ['hostGroups', 'serviceGroups'],
      ['hostGroups', 'businessviews'],
      ['serviceGroups', 'businessviews']
    ]
  );

  return { validationSchema };
};

export default useValidationSchema;
