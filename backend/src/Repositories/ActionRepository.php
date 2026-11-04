<?php
declare(strict_types=1);

namespace RiverReady\Repositories;

use PDO;

// All SQL for the actions table. Every query is a prepared statement.
final class ActionRepository
{
    /** Columns the client may set (location_id comes from the URL). */
    public const FIELDS = ['title', 'description', 'category', 'priority', 'due_date', 'is_done'];

    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function listByLocation(int $locationId): array
    {
        $st = $this->pdo->prepare('SELECT * FROM actions WHERE location_id = :lid ORDER BY is_done ASC, id ASC');
        $st->execute([':lid' => $locationId]);
        return array_map([$this, 'cast'], $st->fetchAll());
    }

    public function find(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM actions WHERE id = :id');
        $st->execute([':id' => $id]);
        $row = $st->fetch();
        return $row ? $this->cast($row) : null;
    }

    public function create(int $locationId, array $d): int
    {
        $st = $this->pdo->prepare(
            'INSERT INTO actions (location_id, title, description, category, priority, due_date, is_done)
             VALUES (:location_id, :title, :description, :category, :priority, :due_date, :is_done)'
        );
        $st->execute($this->bind($d) + [':location_id' => $locationId]);
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $d): void
    {
        $st = $this->pdo->prepare(
            'UPDATE actions SET title = :title, description = :description, category = :category,
                priority = :priority, due_date = :due_date, is_done = :is_done
             WHERE id = :id'
        );
        $st->execute($this->bind($d) + [':id' => $id]);
    }

    public function delete(int $id): bool
    {
        $st = $this->pdo->prepare('DELETE FROM actions WHERE id = :id');
        $st->execute([':id' => $id]);
        return $st->rowCount() > 0;
    }

    private function bind(array $d): array
    {
        $out = [];
        foreach (self::FIELDS as $f) {
            $out[':' . $f] = $d[$f] ?? null;
        }
        $out[':is_done'] = $out[':is_done'] ? 1 : 0; // tinyint column
        return $out;
    }

    private function cast(array $row): array
    {
        $row['id'] = (int) $row['id'];
        $row['location_id'] = (int) $row['location_id'];
        $row['is_done'] = (bool) $row['is_done'];
        return $row;
    }
}
