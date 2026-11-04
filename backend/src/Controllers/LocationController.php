<?php
declare(strict_types=1);

namespace RiverReady\Controllers;

use RiverReady\Http\ApiException;
use RiverReady\Http\Request;
use RiverReady\Http\Response;
use RiverReady\Repositories\LocationRepository;
use RiverReady\Validation\Validator;

// HTTP layer for /api/locations. Unknown JSON fields are silently ignored.
final class LocationController
{
    private LocationRepository $repo;

    public function __construct(LocationRepository $repo)
    {
        $this->repo = $repo;
    }

    public function index(array $params): void
    {
        Response::json(200, $this->repo->all());
    }

    public function show(array $params): void
    {
        Response::json(200, $this->findOrFail(Request::id($params)));
    }

    public function store(array $params): void
    {
        $data = $this->clean(Request::jsonBody());
        $this->validate($data);
        $location = $this->repo->find($this->repo->create($data));
        Response::json(201, $location, ['Location' => Request::basePath() . '/api/locations/' . $location['id']]);
    }

    // PUT merges the supplied fields over the stored record, then validates the result.
    public function update(array $params): void
    {
        $id = Request::id($params);
        $existing = $this->findOrFail($id);
        $input = array_intersect_key(Request::jsonBody(), array_flip(LocationRepository::FIELDS));
        $data = $this->clean($input + $existing);
        $this->validate($data);
        $this->repo->update($id, $data);
        Response::json(200, $this->findOrFail($id));
    }

    public function destroy(array $params): void
    {
        if (!$this->repo->delete(Request::id($params))) {
            throw new ApiException(404, 'NOT_FOUND', 'Location not found.');
        }
        Response::json(204);
    }

    private function findOrFail(int $id): array
    {
        $row = $this->repo->find($id);
        if ($row === null) {
            throw new ApiException(404, 'NOT_FOUND', 'Location not found.');
        }
        return $row;
    }

    /** Keep only known fields; trim text; turn blank optional text into null. */
    private function clean(array $in): array
    {
        $out = [];
        foreach (LocationRepository::FIELDS as $f) {
            $v = $in[$f] ?? null;
            if (is_string($v)) {
                $v = trim($v);
                if ($v === '' && !in_array($f, ['name', 'station_reference'], true)) {
                    $v = null;
                }
            }
            $out[$f] = $v;
        }
        return $out;
    }

    private function validate(array $d): void
    {
        $v = (new Validator())
            ->required('name', $d['name'])->maxLength('name', $d['name'], 100)
            ->required('station_reference', $d['station_reference'])
            ->pattern('station_reference', $d['station_reference'], '/^[A-Za-z0-9_\-]{1,50}$/', 'must be 1-50 letters, numbers, - or _')
            ->maxLength('station_label', $d['station_label'], 150)
            ->maxLength('river_name', $d['river_name'], 100)
            ->maxLength('town', $d['town'], 100)
            ->maxLength('notes', $d['notes'], 2000)
            ->maxLength('risk_note', $d['risk_note'], 255);
        if ($v->fails()) {
            throw new ApiException(422, 'VALIDATION_ERROR', 'Some fields are invalid.', $v->errors());
        }
    }
}
