<?php
declare(strict_types=1);

namespace RiverReady\Repositories;

use PDO;

// All SQL for the locations table. Every query is a prepared statement.
final class LocationRepository
{
    /** Columns the client may set (id and timestamps are server-controlled). */
    public const FIELDS = ['name', 'station_reference', 'station_label', 'river_name', 'town', 'notes', 'risk_note'];

    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function all(): array
    {
        // Prepared even without parameters: the brief requires prepared statements for every query.
        $st = $this->pdo->prepare('SELECT * FROM locations ORDER BY name ASC, id ASC');
        $st->execute();
        return array_map([$this, 'cast'], $st->fetchAll());
    }

    public function find(int $id): ?array
    {
        $st = $this->pdo->prepare('SELECT * FROM locations WHERE id = :id');
        $st->execute([':id' => $id]);
        $row = $st->fetch();
        return $row ? $this->cast($row) : null;
    }

    /** @param array $d values for FIELDS; returns the new id */
    public function create(array $d): int
    {
        $st = $this->pdo->prepare(
            'INSERT INTO locations (name, station_reference, station_label, river_name, town, notes, risk_note)
             VALUES (:name, :station_reference, :station_label, :river_name, :town, :notes, :risk_note)'
        );
        $st->execute($this->bind($d));
        return (int) $this->pdo->lastInsertId();
    }

    public function update(int $id, array $d): void
    {
        $st = $this->pdo->prepare(
            'UPDATE locations SET name = :name, station_reference = :station_reference,
                station_label = :station_label, river_name = :river_name, town = :town,
                notes = :notes, risk_note = :risk_note
             WHERE id = :id'
        );
        $st->execute($this->bind($d) + [':id' => $id]);
    }

    public function delete(int $id): bool
    {
        $st = $this->pdo->prepare('DELETE FROM locations WHERE id = :id');
        $st->execute([':id' => $id]);
        return $st->rowCount() > 0;
    }

    /** Build the named-parameter array from the allowed fields only. */
    private function bind(array $d): array
    {
        $out = [];
        foreach (self::FIELDS as $f) {
            $out[':' . $f] = $d[$f] ?? null;
        }
        return $out;
    }

    private function cast(array $row): array
    {
        $row['id'] = (int) $row['id'];
        return $row;
    }
}
