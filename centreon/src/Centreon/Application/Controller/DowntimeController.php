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

namespace Centreon\Application\Controller;

use Centreon\Domain\Contact\Contact;
use Centreon\Domain\Downtime\Downtime;
use Centreon\Domain\Downtime\Interfaces\DowntimeServiceInterface;
use Centreon\Domain\Exception\EntityNotFoundException;
use Centreon\Domain\Monitoring\Interfaces\MonitoringServiceInterface;
use Centreon\Domain\Monitoring\Resource as ResourceEntity;
use Centreon\Domain\RequestParameters\Interfaces\RequestParametersInterface;
use FOS\RestBundle\Context\Context;
use FOS\RestBundle\View\View;
use JMS\Serializer\SerializerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * This class is design to manage all API REST about downtime requests.
 */
class DowntimeController extends AbstractController
{
    // Groups for serialization
    public const SERIALIZER_GROUPS_HOST = ['downtime_host'];
    public const SERIALIZER_GROUPS_SERVICE = ['downtime_service'];
    private const VALIDATION_SCHEME_FOR_A_DOWNTIME
        = __DIR__ . '/../../../../config/json_validator/latest/Centreon/Downtime/Downtime.json';
    private const VALIDATION_SCHEME_FOR_SEVERAL_DOWNTIMES
        = __DIR__ . '/../../../../config/json_validator/latest/Centreon/Downtime/Downtimes.json';
    private const DOWNTIME_ON_RESOURCES_PAYLOAD_VALIDATION_FILE
        = __DIR__ . '/../../../../config/json_validator/latest/Centreon/Downtime/DowntimeResources.json';

    /** @var DowntimeServiceInterface */
    private DowntimeServiceInterface $downtimeService;

    /** @var MonitoringServiceInterface */
    private MonitoringServiceInterface $monitoringService;

    /**
     * DowntimeController constructor.
     *
     * @param DowntimeServiceInterface $downtimeService
     * @param MonitoringServiceInterface $monitoringService
     */
    public function __construct(
        DowntimeServiceInterface $downtimeService,
        MonitoringServiceInterface $monitoringService
    ) {
        $this->downtimeService = $downtimeService;
        $this->monitoringService = $monitoringService;
    }

    /**
     * Entry point to add multiple host downtimes.
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     *
     * @throws \Exception
     *
     * @return View
     */
    public function addHostDowntimes(Request $request, SerializerInterface $serializer): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_HOST_DOWNTIME)) {
            return $this->view(null, Response::HTTP_UNAUTHORIZED);
        }

        // Validate the content of the request against the JSON schema validator
        $this->validateDataSent($request, self::VALIDATION_SCHEME_FOR_SEVERAL_DOWNTIMES);
        /**
         * @var Downtime[] $downtimes
         */
        $downtimes = $serializer->deserialize(
            (string) $request->getContent(),
            'array<' . Downtime::class . '>',
            'json'
        );

        $this->monitoringService->filterByContact($contact);
        $this->downtimeService->filterByContact($contact);
        foreach ($downtimes as $downtime) {
            try {
                $host = $this->monitoringService->findOneHost($downtime->getResourceId());

                if ($host === null) {
                    throw new EntityNotFoundException(
                        sprintf(_('Host %d not found'), $downtime->getResourceId())
                    );
                }

                $this->downtimeService->addHostDowntime($downtime, $host);
            } catch (EntityNotFoundException $e) {
                continue;
            }
        }

        return $this->view();
    }

    /**
     * Entry point to add multiple service downtimes.
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     *
     * @throws \Exception
     *
     * @return View
     */
    public function addServiceDowntimes(Request $request, SerializerInterface $serializer): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_HOST_DOWNTIME)) {
            return $this->view(null, Response::HTTP_UNAUTHORIZED);
        }

        $this->validateDataSent($request, self::VALIDATION_SCHEME_FOR_SEVERAL_DOWNTIMES);

        $this->monitoringService->filterByContact($contact);
        $this->downtimeService->filterByContact($contact);

        /**
         * @var Downtime[] $downtimes
         */
        $downtimes = $serializer->deserialize(
            (string) $request->getContent(),
            'array<' . Downtime::class . '>',
            'json'
        );

        foreach ($downtimes as $downtime) {
            try {
                $serviceId = $downtime->getResourceId();
                $hostId = $downtime->getParentResourceId();

                if ($hostId === null) {
                    throw new \InvalidArgumentException('Parent resource Id can not be null');
                }
                $service = $this->monitoringService->findOneService($hostId, $serviceId);

                if ($service === null) {
                    throw new EntityNotFoundException(
                        sprintf(
                            _('Service %d on host %d not found'),
                            $downtime->getResourceId(),
                            $downtime->getParentResourceId()
                        )
                    );
                }

                $host = $this->monitoringService->findOneHost($hostId);
                $service->setHost($host);

                $this->downtimeService->addServiceDowntime($downtime, $service);
            } catch (EntityNotFoundException $e) {
                continue;
            }
        }

        return $this->view();
    }

    /**
     * Entry point to add a host downtime.
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param int $hostId Host id for which we want to add a downtime
     *
     * @throws \Exception
     *
     * @return View
     */
    public function addHostDowntime(Request $request, SerializerInterface $serializer, int $hostId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_HOST_DOWNTIME)) {
            return $this->view(null, Response::HTTP_UNAUTHORIZED);
        }

        // Validate the content of the request against the JSON schema validator
        $this->validateDataSent($request, self::VALIDATION_SCHEME_FOR_A_DOWNTIME);

        /**
         * @var Downtime $downtime
         */
        $downtime = $serializer->deserialize(
            (string) $request->getContent(),
            Downtime::class,
            'json'
        );

        $this->monitoringService->filterByContact($contact);
        $host = $this->monitoringService->findOneHost($hostId);
        if ($host === null) {
            throw new EntityNotFoundException(
                sprintf(_('Host %d not found'), $hostId)
            );
        }

        $this->downtimeService->filterByContact($contact);
        $this->downtimeService->addHostDowntime($downtime, $host);

        return $this->view();
    }

    /**
     * Entry point to add a service downtime.
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param int $hostId Host id linked to the service
     * @param int $serviceId Service id for which we want to add a downtime
     *
     * @throws \Exception
     *
     * @return View
     */
    public function addServiceDowntime(
        Request $request,
        SerializerInterface $serializer,
        int $hostId,
        int $serviceId
    ): View {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_SERVICE_DOWNTIME)) {
            return $this->view(null, Response::HTTP_UNAUTHORIZED);
        }

        // Validate the content of the request against the JSON schema validator
        $this->validateDataSent($request, self::VALIDATION_SCHEME_FOR_A_DOWNTIME);

        /**
         * @var Downtime $downtime
         */
        $downtime = $serializer->deserialize((string) $request->getContent(), Downtime::class, 'json');

        $this->monitoringService->filterByContact($contact);

        $service = $this->monitoringService->findOneService($hostId, $serviceId);
        if ($service === null) {
            throw new EntityNotFoundException(
                sprintf(_('Service %d on host %d not found'), $serviceId, $hostId)
            );
        }

        $host = $this->monitoringService->findOneHost($hostId);
        $service->setHost($host);

        $this->downtimeService
            ->filterByContact($contact)
            ->addServiceDowntime($downtime, $service);

        return $this->view();
    }

    /**
     * Entry point to add a service downtime.
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     * @param int $metaId ID of the Meta Service
     *
     * @throws \Exception
     *
     * @return View
     */
    public function addMetaServiceDowntime(Request $request, SerializerInterface $serializer, int $metaId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_SERVICE_DOWNTIME)) {
            return $this->view(null, Response::HTTP_UNAUTHORIZED);
        }

        $this->validateDataSent($request, self::VALIDATION_SCHEME_FOR_A_DOWNTIME);

        /**
         * @var Downtime $downtime
         */
        $downtime = $serializer->deserialize(
            (string) $request->getContent(),
            Downtime::class,
            'json'
        );
        $this->monitoringService->filterByContact($contact);

        $service = $this->monitoringService->findOneServiceByDescription('meta_' . $metaId);
        if (is_null($service)) {
            throw new EntityNotFoundException(
                sprintf(_('Meta Service linked to service %d not found'), $metaId)
            );
        }

        $hostId = $service->getHost()?->getId();
        if ($hostId === null) {
            throw new EntityNotFoundException(
                sprintf(_('Host meta for meta %d not found'), $metaId)
            );
        }

        $host = $this->monitoringService->findOneHost($hostId);

        if ($host === null) {
            throw new EntityNotFoundException(
                sprintf(_('Host meta for meta %d not found'), $metaId)
            );
        }
        $service->setHost($host);

        $this->downtimeService
            ->filterByContact($contact)
            ->addServiceDowntime($downtime, $service);

        return $this->view();
    }

    /**
     * Entry point to find the last hosts downtimes.
     *
     * @param RequestParametersInterface $requestParameters
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findHostDowntimes(RequestParametersInterface $requestParameters): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $hostsDowntime = $this->downtimeService
            ->filterByContact($contact)
            ->findHostDowntimes();

        $context = (new Context())->setGroups(Downtime::SERIALIZER_GROUPS_MAIN);

        return $this->view(
            [
                'result' => $hostsDowntime,
                'meta' => $requestParameters->toArray(),
            ]
        )->setContext($context);
    }

    /**
     * Entry point to find the last services downtimes.
     *
     * @param RequestParametersInterface $requestParameters
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findServiceDowntimes(RequestParametersInterface $requestParameters): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $servicesDowntimes = $this->downtimeService
            ->filterByContact($contact)
            ->findServicesDowntimes();

        $context = (new Context())->setGroups(Downtime::SERIALIZER_GROUPS_SERVICE);

        return $this->view(
            [
                'result' => $servicesDowntimes,
                'meta' => $requestParameters->toArray(),
            ]
        )->setContext($context);
    }

    /**
     * Entry point to find the last downtimes linked to a service.
     *
     * @param RequestParametersInterface $requestParameters
     * @param int $hostId Host id linked to this service
     * @param int $serviceId Service id for which we want to find downtimes
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findDowntimesByService(
        RequestParametersInterface $requestParameters,
        int $hostId,
        int $serviceId
    ): View {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $this->monitoringService->filterByContact($contact);

        if ($this->monitoringService->isHostExists($hostId)) {
            $downtimesByHost = $this->downtimeService
                ->filterByContact($contact)
                ->findDowntimesByService($hostId, $serviceId);

            $context = (new Context())->setGroups(Downtime::SERIALIZER_GROUPS_SERVICE);

            return $this->view(
                [
                    'result' => $downtimesByHost,
                    'meta' => $requestParameters->toArray(),
                ]
            )->setContext($context);
        }
  
            return View::create(null, Response::HTTP_NOT_FOUND, []);
    }

    /**
     * Entry point to find the last downtimes linked to a service.
     *
     * @param RequestParametersInterface $requestParameters
     * @param int $metaId ID of the metaservice
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findDowntimesByMetaService(RequestParametersInterface $requestParameters, int $metaId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $this->monitoringService->filterByContact($contact);

        $downtimesByHost = $this->downtimeService
            ->filterByContact($contact)
            ->findDowntimesByMetaService($metaId);

        $context = (new Context())->setGroups(Downtime::SERIALIZER_GROUPS_SERVICE);

        return $this->view(
            [
                'result' => $downtimesByHost,
                'meta' => $requestParameters->toArray(),
            ]
        )->setContext($context);
    }

    /**
     * Entry point to find one host downtime.
     *
     * @param int $downtimeId Downtime id to find
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findOneDowntime(int $downtimeId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $downtime = $this->downtimeService
            ->filterByContact($contact)
            ->findOneDowntime($downtimeId);

        if ($downtime !== null) {
            $context = (new Context())
                ->setGroups(Downtime::SERIALIZER_GROUPS_SERVICE)
                ->enableMaxDepth();

            return $this->view($downtime)->setContext($context);
        }
  
            return View::create(null, Response::HTTP_NOT_FOUND, []);
    }

    /**
     * Entry point to find the last downtimes.
     *
     * @param RequestParametersInterface $requestParameters
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findDowntimes(RequestParametersInterface $requestParameters): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $hostsDowntime = $this->downtimeService
            ->filterByContact($contact)
            ->findDowntimes();

        $context = (new Context())->setGroups(Downtime::SERIALIZER_GROUPS_SERVICE);

        return $this->view(
            [
                'result' => $hostsDowntime,
                'meta' => $requestParameters->toArray(),
            ]
        )->setContext($context);
    }

    /**
     * Entry point to find the last downtimes linked to a host.
     *
     * @param RequestParametersInterface $requestParameters
     * @param int $hostId Host id for which we want to find downtimes
     *
     * @throws \Exception
     *
     * @return View
     */
    public function findDowntimesByHost(RequestParametersInterface $requestParameters, int $hostId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $this->monitoringService->filterByContact($contact);
        $withServices = $requestParameters->getExtraParameter('with_services') === 'true';

        if ($this->monitoringService->isHostExists($hostId)) {
            $downtimesByHost = $this->downtimeService
                ->filterByContact($contact)
                ->findDowntimesByHost($hostId, $withServices);

            $contextGroups = $withServices
                ? Downtime::SERIALIZER_GROUPS_SERVICE
                : Downtime::SERIALIZER_GROUPS_MAIN;
            $context = (new Context())->setGroups($contextGroups)->enableMaxDepth();

            return $this->view(
                [
                    'result' => $downtimesByHost,
                    'meta' => $requestParameters->toArray(),
                ]
            )->setContext($context);
        }
  
            return View::create(null, Response::HTTP_NOT_FOUND, []);
    }

    /**
     * Entry point to cancel one downtime.
     *
     * @param int $downtimeId Downtime id to cancel
     *
     * @throws \Exception
     *
     * @return View
     */
    public function cancelOneDowntime(int $downtimeId): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        $downtime = $this->downtimeService
            ->filterByContact($contact)
            ->findOneDowntime($downtimeId);

        if ($downtime === null) {
            return View::create(null, Response::HTTP_NOT_FOUND, []);
        }
        $host = $this->monitoringService
            ->filterByContact($contact)
            ->findOneHost($downtime->getHostId());

        if ($host === null) {
            return View::create(null, Response::HTTP_NOT_FOUND, []);
        }

        if (! $contact->isAdmin()) {
            $isServiceDowntime = $downtime->getServiceId() !== null;
            $svcCancel = $contact->hasRole(Contact::ROLE_CANCEL_SERVICE_DOWNTIME);
            $hostCancel = $contact->hasRole(Contact::ROLE_CANCEL_HOST_DOWNTIME);
            if (($isServiceDowntime && ! $svcCancel) || (! $isServiceDowntime && ! $hostCancel)) {
                return $this->view(null, Response::HTTP_UNAUTHORIZED);
            }
        }

        $this->downtimeService->cancelDowntime($downtimeId, $host);

        return $this->view();
    }

    /**
     * Entry point to bulk set downtime for resources (hosts and services).
     *
     * @param Request $request
     * @param SerializerInterface $serializer
     *
     * @throws \Exception
     *
     * @return View
     */
    public function massDowntimeResources(Request $request): View
    {
        $this->denyAccessUnlessGrantedForApiRealtime();

        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();

        /**
         * Validate POST data for downtime on resources.
         */
        $payload = $this->validateAndRetrieveDataSent($request, self::DOWNTIME_ON_RESOURCES_PAYLOAD_VALIDATION_FILE);
        $downtime = $this->createDowntimeFromPayload($payload);

        $this->downtimeService->filterByContact($contact);

        foreach ($payload['resources'] as $resourcePayload) {
            $resource = $this->createResourceFromPayload($resourcePayload);
            // start applying downtime process
            try {
                if ($this->hasDtRightsForResource($contact, $resource)) {
                    if (! $contact->isAdmin() && ! $contact->hasRole(Contact::ROLE_ADD_SERVICE_DOWNTIME)) {
                        $downtime->setWithServices(false);
                    }
                    $this->downtimeService->addResourceDowntime($resource, $downtime);
                }
            } catch (\Exception $e) {
                throw $e;
            }
        }

        return $this->view();
    }

    /**
     * @param array<string, mixed> $payload
     *
     * @return Downtime
     */
    private function createDowntimeFromPayload(array $payload): Downtime
    {
        $downtime = new Downtime();

        if (isset($payload['downtime']['comment'])) {
            $downtime->setComment($payload['downtime']['comment']);
        }

        if (isset($payload['downtime']['duration'])) {
            $downtime->setDuration($payload['downtime']['duration']);
        }

        if (isset($payload['downtime']['with_services'])) {
            $downtime->setWithServices($payload['downtime']['with_services']);
        }

        if (isset($payload['downtime']['end_time'])) {
            $endTime = new \DateTime($payload['downtime']['end_time']);
            $downtime->setEndTime($endTime);
        }

        if (isset($payload['downtime']['start_time'])) {
            $startTime = new \DateTime($payload['downtime']['start_time']);
            $downtime->setStartTime($startTime);
        }

        if (isset($payload['downtime']['is_fixed'])) {
            $downtime->setFixed($payload['downtime']['is_fixed']);
        }

        return $downtime;
    }

    /**
     * Creates a ResourceEntity with payload sent.
     *
     * @param array<string, mixed> $payload
     *
     * @return ResourceEntity
     */
    private function createResourceFromPayload(array $payload): ResourceEntity
    {
        $resource = (new ResourceEntity())
            ->setType($payload['type'])
            ->setId($payload['id']);

        if ($payload['parent'] !== null) {
            $resource->setParent(
                (new ResourceEntity())
                    ->setId($payload['parent']['id'])
                    ->setType(ResourceEntity::TYPE_HOST)
            );
        }

        return $resource;
    }

    /**
     * @param Contact $contact
     * @param ResourceEntity $resouce
     *
     * @return bool
     */
    private function hasDtRightsForResource(Contact $contact, ResourceEntity $resouce): bool
    {
        $hasRights = false;

        if ($resouce->getType() === ResourceEntity::TYPE_HOST) {
            $hasRights = $contact->isAdmin() || $contact->hasRole(Contact::ROLE_ADD_HOST_DOWNTIME);
        } elseif ($resouce->getType() === ResourceEntity::TYPE_SERVICE) {
            $hasRights = $contact->isAdmin() || $contact->hasRole(Contact::ROLE_ADD_SERVICE_DOWNTIME);
        } elseif ($resouce->getType() === ResourceEntity::TYPE_META) {
            $hasRights = $contact->isAdmin() || $contact->hasRole(Contact::ROLE_ADD_SERVICE_DOWNTIME);
        }

        return $hasRights;
    }
}
