<?php

/*
 * Copyright 2005 - 2023 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * For more information : contact@centreon.com
 *
 */

declare(strict_types=1);

namespace Core\Service\Infrastructure\API\AddService;

use Centreon\Application\Controller\AbstractController;
use Centreon\Domain\Log\LoggerTrait;
use Core\Application\Common\UseCase\InvalidArgumentResponse;
use Core\Common\Domain\YesNoDefault;
use Core\Service\Application\UseCase\AddService\AddService;
use Core\Service\Application\UseCase\AddService\AddServiceRequest;
use Core\Service\Application\UseCase\AddService\MacroDto;
use Core\Service\Infrastructure\Model\YesNoDefaultConverter;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

/**
 * @phpstan-type _ServiceTemplate = array{
 *     name: string,
 *     host_id: int,
 *     comment: string|null,
 *     service_template_id: int|null,
 *     check_command_id: int|null,
 *     check_command_args: list<string>|null,
 *     check_timeperiod_id: int|null,
 *     max_check_attempts: int|null,
 *     normal_check_interval: int|null,
 *     retry_check_interval: int|null,
 *     active_check_enabled: int|null,
 *     passive_check_enabled: int|null,
 *     volatility_enabled: int|null,
 *     notification_enabled: int|null,
 *     is_contact_additive_inheritance: boolean|null,
 *     is_contact_group_additive_inheritance: boolean|null,
 *     notification_interval: int|null,
 *     notification_timeperiod_id: int|null,
 *     notification_type: int|null,
 *     first_notification_delay: int|null,
 *     recovery_notification_delay: int|null,
 *     acknowledgement_timeout: int|null,
 *     freshness_checked: int|null,
 *     freshness_threshold: int|null,
 *     flap_detection_enabled: int|null,
 *     low_flap_threshold: int|null,
 *     high_flap_threshold: int|null,
 *     event_handler_enabled: int|null,
 *     event_handler_command_id: int|null,
 *     event_handler_command_args: list<string>|null,
 *     graph_template_id: int|null,
 *     note: string|null,
 *     note_url: string|null,
 *     action_url: string|null,
 *     icon_id: int|null,
 *     icon_alternative: string|null,
 *     severity_id: int|null,
 *     is_activated: boolean|null,
 *     is_locked: boolean|null,
 *     geo_coords: string|null,
 *     macros: array<array{name: string, value: string|null, is_password: bool, description: string|null}>,
 *     service_categories: list<int>|null,
 *     service_groups: list<int>|null
 * }
 */
final class AddServiceController extends AbstractController
{
    use LoggerTrait;

    /**
     * @param AddService $useCase
     * @param AddServiceOnPremPresenter $onPremPresenter
     * @param AddServiceSaasPresenter $saasPresenter
     * @param bool $isCloudPlatform
     * @param Request $request
     *
     * @throws AccessDeniedException
     *
     * @return Response
     */
    public function __invoke(
        AddService $useCase,
        AddServiceOnPremPresenter $onPremPresenter,
        AddServiceSaasPresenter $saasPresenter,
        bool $isCloudPlatform,
        Request $request,
    ): Response {
        $this->denyAccessUnlessGrantedForApiConfiguration();

        $presenter = $isCloudPlatform ? $saasPresenter : $onPremPresenter;
        $validationSchema = $isCloudPlatform
            ? 'AddServiceSaasSchema.json'
            : 'AddServiceOnPremSchema.json';

        try {
            /** @var _ServiceTemplate $data */
            $data = $this->validateAndRetrieveDataSent(
                $request,
                __DIR__ . DIRECTORY_SEPARATOR . $validationSchema
            );
            $useCase($this->createDto($data, $isCloudPlatform), $presenter);
        } catch (\InvalidArgumentException $ex) {
            $this->error($ex->getMessage(), ['trace' => $ex->getTraceAsString()]);
            $presenter->setResponseStatus(new InvalidArgumentResponse($ex));
        }

        return $presenter->show();
    }

    /**
     * @param _ServiceTemplate $request
     * @param bool $isCloudPlatform
     *
     * @return AddServiceRequest
     */
    private function createDto(array $request, bool $isCloudPlatform): AddServiceRequest
    {
        $defaultOptionValue = YesNoDefaultConverter::toInt(YesNoDefault::Default);
        $dto = new AddServiceRequest();
        $dto->name = $request['name'];
        $dto->hostId = $request['host_id'];
        $dto->comment = $request['comment'] ?? null;
        $dto->serviceTemplateParentId = $request['service_template_id'];
        $dto->commandId = $request['check_command_id'];
        $dto->commandArguments = $request['check_command_args'] ?? [];
        $dto->checkTimePeriodId = $request['check_timeperiod_id'];
        $dto->maxCheckAttempts = $request['max_check_attempts'] ?? null;
        $dto->normalCheckInterval = $request['normal_check_interval'] ?? null;
        $dto->retryCheckInterval = $request['retry_check_interval'] ?? null;
        $dto->activeChecks = $request['active_check_enabled'] ?? $defaultOptionValue;
        $dto->passiveCheck = $request['passive_check_enabled'] ?? $defaultOptionValue;
        $dto->volatility = $request['volatility_enabled'] ?? $defaultOptionValue;
        $dto->notificationsEnabled = $request['notification_enabled'] ?? $defaultOptionValue;
        $dto->isContactAdditiveInheritance = $request['is_contact_additive_inheritance'] ?? false;
        $dto->isContactGroupAdditiveInheritance = $request['is_contact_group_additive_inheritance'] ?? false;
        $dto->notificationInterval = $request['notification_interval'] ?? null;
        $dto->notificationTimePeriodId = $request['notification_timeperiod_id'] ?? null;
        $dto->notificationTypes = $request['notification_type'] ?? null;
        $dto->firstNotificationDelay = $request['first_notification_delay'] ?? null;
        $dto->recoveryNotificationDelay = $request['recovery_notification_delay'] ?? null;
        $dto->acknowledgementTimeout = $request['acknowledgement_timeout'] ?? null;
        $dto->checkFreshness = $request['freshness_checked'] ?? $defaultOptionValue;
        $dto->freshnessThreshold = $request['freshness_threshold'] ?? null;
        $dto->flapDetectionEnabled = $request['flap_detection_enabled'] ?? $defaultOptionValue;
        $dto->lowFlapThreshold = $request['low_flap_threshold'] ?? null;
        $dto->highFlapThreshold = $request['high_flap_threshold'] ?? null;
        $dto->eventHandlerEnabled = $request['event_handler_enabled'] ?? $defaultOptionValue;
        $dto->eventHandlerId = $request['event_handler_command_id'] ?? null;
        $dto->eventHandlerArguments = $request['event_handler_command_args'] ?? [];
        $dto->graphTemplateId = $request['graph_template_id'] ?? null;
        $dto->note = $request['note'];
        $dto->noteUrl = $request['note_url'];
        $dto->actionUrl = $request['action_url'];
        $dto->iconId = $request['icon_id'] ?? null;
        $dto->iconAlternativeText = $request['icon_alternative'] ?? null;
        $dto->severityId = $request['severity_id'];
        $dto->geoCoords = $request['geo_coords'] ?? '';
        $dto->isActivated = $request['is_activated'] ?? true;
        $dto->serviceCategories = $request['service_categories'] ?? [];
        $dto->serviceGroups = $request['service_groups'] ?? [];

        foreach ($request['macros'] as $macro) {
            $dto->macros[] = new MacroDto(
                $macro['name'],
                $macro['value'],
                (bool) $macro['is_password'],
                $macro['description']
            );
        }

        return $dto;
    }
}
