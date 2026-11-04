<?php
declare(strict_types=1);

namespace RiverReady\Controllers;

use RiverReady\Http\ApiException;
use RiverReady\Http\Request;
use RiverReady\Http\Response;
use RiverReady\Repositories\ActionRepository;
use RiverReady\Repositories\LocationRepository;
use RiverReady\Services\EaClient;

// GET /api/locations/{id}/overview: stored data + live EA data in one call.
// EA problems never change the status code: the stored parts are always returned.
final class OverviewController
{
    private LocationRepository $locations;
    private ActionRepository $actions;
    private EaClient $ea;

    public function __construct(LocationRepository $locations, ActionRepository $actions, EaClient $ea)
    {
        $this->locations = $locations;
        $this->actions   = $actions;
        $this->ea        = $ea;
    }

    public function show(array $params): void
    {
        $id = Request::id($params);
        $location = $this->locations->find($id);
        if ($location === null) {
            throw new ApiException(404, 'NOT_FOUND', 'Location not found.');
        }
        $actions = $this->actions->listByLocation($id);

        $r = $this->ea->station((string) $location['station_reference']);
        // A station EA no longer knows about is reported as "empty", not as an error.
        $status = $r['status'] === 'not_found' ? 'empty' : $r['status'];

        Response::json(200, [
            'location' => $location,
            'actions'  => $actions,
            'external' => ['status' => $status, 'data' => $r['data'], 'fetchedAt' => $r['fetchedAt']],
        ]);
    }
}
