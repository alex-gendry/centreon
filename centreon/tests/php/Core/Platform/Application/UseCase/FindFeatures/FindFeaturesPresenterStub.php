<?php

/*
 * Copyright 2005 - 2022 Centreon (https://www.centreon.com/)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
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

namespace Tests\Core\Platform\Application\UseCase\FindFeatures;

use Core\Application\Common\UseCase\ResponseStatusInterface;
use Core\Platform\Application\UseCase\FindFeatures\FindFeaturesPresenterInterface;
use Core\Platform\Application\UseCase\FindFeatures\FindFeaturesResponse;
use Core\Infrastructure\Common\API\DefaultPresenter;

class FindFeaturesPresenterStub implements FindFeaturesPresenterInterface
{
    public FindFeaturesResponse|ResponseStatusInterface $data;

    public function presentResponse(FindFeaturesResponse|ResponseStatusInterface $data): void
    {
        $this->data = $data;
    }
}
