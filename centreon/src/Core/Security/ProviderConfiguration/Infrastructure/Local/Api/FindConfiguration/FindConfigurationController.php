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

namespace Core\Security\ProviderConfiguration\Infrastructure\Local\Api\FindConfiguration;

use Centreon\Application\Controller\AbstractController;
use Centreon\Domain\Contact\Contact;
use Core\Security\ProviderConfiguration\Application\Local\UseCase\FindConfiguration\FindConfiguration;
use Core\Security\ProviderConfiguration\Application\Local\UseCase\FindConfiguration\FindConfigurationPresenterInterface;
use Symfony\Component\HttpFoundation\Response;

class FindConfigurationController extends AbstractController
{
    /**
     * @param FindConfiguration $useCase
     * @param FindConfigurationPresenterInterface $presenter
     *
     * @return object
     */
    public function __invoke(
        FindConfiguration $useCase,
        FindConfigurationPresenterInterface $presenter,
    ): object {
        $this->denyAccessUnlessGrantedForApiConfiguration();
        /**
         * @var Contact $contact
         */
        $contact = $this->getUser();
        if (! $contact->hasTopologyRole(Contact::ROLE_ADMINISTRATION_AUTHENTICATION_READ_WRITE)) {
            return $this->view(null, Response::HTTP_FORBIDDEN);
        }

        $useCase($presenter);

        return $presenter->show();
    }
}
