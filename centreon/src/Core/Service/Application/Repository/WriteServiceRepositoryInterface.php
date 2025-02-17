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

namespace Core\Service\Application\Repository;

use Core\Service\Domain\Model\NewService;

interface WriteServiceRepositoryInterface
{
    /**
     * Delete a service by ID.
     *
     * @param int $serviceId
     *
     * @throws \Throwable
     */
    public function delete(int $serviceId): void;

    /**
     * Delete services by ID.
     *
     * @param int ...$serviceIds
     */
    public function deleteByIds(int ...$serviceIds): void;

    /**
     * Add a new service.
     *
     * @param NewService $newService
     *
     * @throws \Throwable
     *
     * @return int
     */
    public function add(NewService $newService): int;
}
