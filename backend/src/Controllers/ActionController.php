<?php
declare(strict_types=1);

namespace RiverReady\Controllers;

use RiverReady\Http\ApiException;
use RiverReady\Http\Request;
use RiverReady\Http\Response;
use RiverReady\Repositories\ActionRepository;
use RiverReady\Repositories\LocationRepository;
use RiverReady\Validation\Validator;

// HTTP layer for preparedness actions. Unknown JSON fields are silently ignored.
final class ActionController
{
    private const CATEGORIES = ['documents', 'supplies', 'home', 'people', 'evacuation', 'other'];
    private const PRIORITIES = ['low', 'medium', 'high'];

    private ActionRepository $actions;
    private LocationRepository $locations;

    public function __construct(ActionRepository $actions, LocationRepository $locations)
    {
        $this->actions = $actions;
        $this->locations = $locations;
    }

    public function index(array $params): void
    {
        $locationId = $this->requireLocation($params);
        Response::json(200, $this->actions->listByLocation($locationId));
    }

    public function store(array $params): void
    {
        $locationId = $this->requireLocation($params);
        // Defaults mirror the column defaults in schema.sql
        $defaults = ['category' => 'other', 'priority' => 'medium', 'is_done' => false];
        $data = $this->clean($this->input() + $defaults);
        $this->validate($data);
        $action = $this->actions->find($this->actions->create($locationId, $data));
        Response::json(201, $action, ['Location' => Request::basePath() . '/api/actions/' . $action['id']]);
    }

    // PUT merges supplied fields over the stored action, so {"is_done":true} works as a toggle.
    public function update(array $params): void
    {
        $id = Request::id($params);
        $existing = $this->findOrFail($id);
        $data = $this->clean($this->input() + $existing);
        $this->validate($data);
        $this->actions->update($id, $data);
        Response::json(200, $this->findOrFail($id));
    }

    public function destroy(array $params): void
    {
        if (!$this->actions->delete(Request::id($params))) {
            throw new ApiException(404, 'NOT_FOUND', 'Action not found.');
        }
        Response::json(204);
    }

    /** Validate the {id} param and make sure the location exists (404 otherwise). */
    private function requireLocation(array $params): int
    {
        $id = Request::id($params);
        if ($this->locations->find($id) === null) {
            throw new ApiException(404, 'NOT_FOUND', 'Location not found.');
        }
        return $id;
    }

    private function findOrFail(int $id): array
    {
        $row = $this->actions->find($id);
        if ($row === null) {
            throw new ApiException(404, 'NOT_FOUND', 'Action not found.');
        }
        return $row;
    }

    private function input(): array
    {
        return array_intersect_key(Request::jsonBody(), array_flip(ActionRepository::FIELDS));
    }

    /** Keep only known fields; trim text; turn blank optional text/date into null. */
    private function clean(array $in): array
    {
        $out = [];
        foreach (ActionRepository::FIELDS as $f) {
            $v = $in[$f] ?? null;
            if (is_string($v)) {
                $v = trim($v);
                if ($v === '' && !in_array($f, ['title', 'category', 'priority'], true)) {
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
            ->required('title', $d['title'])->maxLength('title', $d['title'], 150)
            ->maxLength('description', $d['description'], 2000)
            ->required('category', $d['category'])->enum('category', $d['category'], self::CATEGORIES)
            ->required('priority', $d['priority'])->enum('priority', $d['priority'], self::PRIORITIES)
            ->date('due_date', $d['due_date'])
            ->boolean('is_done', $d['is_done']);
        if ($v->fails()) {
            throw new ApiException(422, 'VALIDATION_ERROR', 'Some fields are invalid.', $v->errors());
        }
    }
}
