<?php
declare(strict_types=1);

namespace RiverReady\Controllers;

use RiverReady\Http\ApiException;
use RiverReady\Http\Response;
use RiverReady\Services\EaClient;
use RiverReady\Validation\Validator;

// HTTP layer for /api/stations. Params are validated before EA is contacted.
final class StationController
{
    private EaClient $ea;

    public function __construct(EaClient $ea)
    {
        $this->ea = $ea;
    }

    public function search(array $params): void
    {
        // Arrays (?search[]=x) are not valid text, so treat them as missing.
        $term  = is_string($_GET['search'] ?? null) ? trim($_GET['search']) : '';
        $limit = $_GET['limit'] ?? '20';

        $v = (new Validator())
            ->required('search', $term)->maxLength('search', $term, 60)
            ->pattern('limit', $limit, '/^(?:[1-9]|1\d|20)$/', 'must be a whole number from 1 to 20');
        if ($v->fails()) {
            throw new ApiException(400, 'BAD_REQUEST', 'Invalid search parameters.', $v->errors());
        }

        $r = $this->ea->searchStations($term, (int) $limit);
        $this->failIfUnavailable($r['status']);
        Response::json(200, ['items' => $r['data'] ?? [], 'fetchedAt' => $r['fetchedAt']]);
    }

    public function show(array $params): void
    {
        $ref = (string) ($params['ref'] ?? '');
        $v = (new Validator())->pattern('ref', $ref, '/^[A-Za-z0-9_\-]{1,50}$/', 'must be 1-50 letters, numbers, - or _');
        if ($v->fails()) {
            throw new ApiException(400, 'BAD_REQUEST', 'Invalid station reference.', $v->errors());
        }

        $r = $this->ea->station($ref);
        $this->failIfUnavailable($r['status']);
        if ($r['status'] === 'not_found') {
            throw new ApiException(404, 'NOT_FOUND', 'Station not found.');
        }
        // status 'empty' = station exists but has no readings right now: still 200, latest values are null.
        Response::json(200, ['station' => $r['data'], 'status' => $r['status'], 'fetchedAt' => $r['fetchedAt']]);
    }

    private function failIfUnavailable(string $status): void
    {
        if ($status === 'timeout') {
            throw new ApiException(504, 'EA_TIMEOUT', 'The Environment Agency service took too long to respond.');
        }
        if ($status === 'unavailable') {
            throw new ApiException(502, 'EA_UNAVAILABLE', 'The Environment Agency service is currently unavailable.');
        }
    }
}
