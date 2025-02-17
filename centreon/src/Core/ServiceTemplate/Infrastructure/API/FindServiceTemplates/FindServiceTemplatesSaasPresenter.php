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

namespace Core\ServiceTemplate\Infrastructure\API\FindServiceTemplates;

use Centreon\Domain\RequestParameters\Interfaces\RequestParametersInterface;
use Core\Application\Common\UseCase\AbstractPresenter;
use Core\Application\Common\UseCase\ResponseStatusInterface;
use Core\Infrastructure\Common\Presenter\PresenterFormatterInterface;
use Core\Infrastructure\Common\Presenter\PresenterTrait;
use Core\ServiceTemplate\Application\UseCase\FindServiceTemplates\FindServiceTemplateResponse;
use Core\ServiceTemplate\Application\UseCase\FindServiceTemplates\FindServiceTemplatesPresenterInterface;

class FindServiceTemplatesSaasPresenter extends AbstractPresenter implements FindServiceTemplatesPresenterInterface
{
    use PresenterTrait;

    public function __construct(
        private readonly RequestParametersInterface $requestParameters,
        protected PresenterFormatterInterface $presenterFormatter,
    ) {
        parent::__construct($presenterFormatter);
    }

    public function presentResponse(ResponseStatusInterface|FindServiceTemplateResponse $response): void
    {
        if ($response instanceof ResponseStatusInterface) {
            $this->setResponseStatus($response);
        } else {
            $result = [];
            foreach ($response->serviceTemplates as $dto) {
                $result[] = [
                    'id' => $dto->id,
                    'name' => $dto->name,
                    'alias' => $dto->alias,
                    'service_template_id' => $dto->serviceTemplateId,
                    'check_timeperiod_id' => $dto->checkTimePeriodId,
                    'note' => $dto->note,
                    'note_url' => $dto->noteUrl,
                    'action_url' => $dto->actionUrl,
                    'severity_id' => $dto->severityId,
                    'host_templates' => $dto->hostTemplateIds,
                    'is_locked' => $dto->isLocked,
                ];
            }
            $this->present([
                'result' => $result,
                'meta' => $this->requestParameters->toArray(),
            ]);
        }
    }
}
