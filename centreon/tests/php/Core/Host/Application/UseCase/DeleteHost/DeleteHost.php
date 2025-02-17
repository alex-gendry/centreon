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

use Centreon\Domain\Contact\Contact;
use Centreon\Domain\Contact\Interfaces\ContactInterface;
use Centreon\Domain\Repository\Interfaces\DataStorageEngineInterface;
use Core\Application\Common\UseCase\ErrorResponse;
use Core\Application\Common\UseCase\ForbiddenResponse;
use Core\Application\Common\UseCase\NoContentResponse;
use Core\Application\Common\UseCase\NotFoundResponse;
use Core\Host\Application\Exception\HostException;
use Core\Host\Application\Repository\ReadHostRepositoryInterface;
use Core\Host\Application\Repository\WriteHostRepositoryInterface;
use Core\Host\Application\UseCase\DeleteHost\DeleteHost;
use Core\Infrastructure\Common\Presenter\PresenterFormatterInterface;
use Core\Service\Application\Repository\ReadServiceRepositoryInterface;
use Core\Service\Application\Repository\WriteServiceRepositoryInterface;
use Tests\Core\Host\Infrastructure\API\DeleteHost\DeleteHostPresenterStub;

beforeEach(closure: function (): void {
    $this->readHostRepository = $this->createMock(ReadHostRepositoryInterface::class);
    $this->writeHostRepository = $this->createMock(WriteHostRepositoryInterface::class);
    $this->readServiceRepository = $this->createMock(ReadServiceRepositoryInterface::class);
    $this->writeServiceRepository = $this->createMock(WriteServiceRepositoryInterface::class);
    $this->contact = $this->createMock(ContactInterface::class);
    $this->storageEngine = $this->createMock(DataStorageEngineInterface::class);
    $this->presenter = new DeleteHostPresenterStub($this->createMock(PresenterFormatterInterface::class));

    $this->useCase = new DeleteHost(
        $this->readHostRepository,
        $this->writeHostRepository,
        $this->readServiceRepository,
        $this->writeServiceRepository,
        $this->contact,
        $this->storageEngine,
    );
});

it('should present a ForbiddenResponse when the user has insufficient rights', function (): void {
    $this->contact
        ->expects($this->once())
        ->method('hasTopologyRole')
        ->willReturnMap([[Contact::ROLE_CONFIGURATION_HOSTS_WRITE, false]]);

    ($this->useCase)(1, $this->presenter);
    expect($this->presenter->response)
        ->toBeInstanceOf(ForbiddenResponse::class)
        ->and($this->presenter->response->getMessage())
        ->toBe(HostException::deleteNotAllowed()->getMessage());
});

it('should present a NotFoundResponse when the service template is not found', function (): void {
    $hostId = 1;

    $this->contact
        ->expects($this->once())
        ->method('hasTopologyRole')
        ->willReturn(true);

    $this->readHostRepository
        ->expects($this->once())
        ->method('exists')
        ->with($hostId)
        ->willReturn(false);

    ($this->useCase)($hostId, $this->presenter);

    expect($this->presenter->response)
        ->toBeInstanceOf(NotFoundResponse::class)
        ->and($this->presenter->response->getMessage())
        ->toBe((new NotFoundResponse('Host'))->getMessage());
});

it('should present an ErrorResponse when an exception is thrown', function (): void {
    $hostId = 1;

    $this->contact
        ->expects($this->once())
        ->method('hasTopologyRole')
        ->willReturn(true);

    $this->readHostRepository
        ->expects($this->once())
        ->method('exists')
        ->with($hostId)
        ->willReturn(true);

    $this->storageEngine
        ->expects($this->once())
        ->method('startTransaction');

    $this->readServiceRepository
        ->expects($this->once())
        ->method('findServiceIdsLinkedToHostId')
        ->with($hostId)
        ->willThrowException(new \Exception());

    $this->storageEngine
        ->expects($this->once())
        ->method('rollbackTransaction');

    ($this->useCase)($hostId, $this->presenter);

    expect($this->presenter->response)
        ->toBeInstanceOf(ErrorResponse::class)
        ->and($this->presenter->response->getMessage())
        ->toBe(HostException::errorWhileDeleting(new \Exception())->getMessage());
});

it('should present a NoContentResponse when the service template has been deleted', function (): void {
    $hostId = 1;
    $serviceIdsFound = [11, 18];

    $this->contact
        ->expects($this->once())
        ->method('hasTopologyRole')
        ->willReturn(true);

    $this->storageEngine
        ->expects($this->once())
        ->method('startTransaction');

    $this->readHostRepository
        ->expects($this->once())
        ->method('exists')
        ->with($hostId)
        ->willReturn(true);

    $this->readServiceRepository
        ->expects($this->once())
        ->method('findServiceIdsLinkedToHostId')
        ->with($hostId)
        ->willReturn($serviceIdsFound);

    $this->writeServiceRepository
        ->expects($this->once())
        ->method('deleteByIds')
        ->with(...$serviceIdsFound);

    $this->writeHostRepository
        ->expects($this->once())
        ->method('deleteById')
        ->with($hostId);

    $this->storageEngine
        ->expects($this->once())
        ->method('commitTransaction');

    ($this->useCase)(1, $this->presenter);

    expect($this->presenter->response)->toBeInstanceOf(NoContentResponse::class);
});
