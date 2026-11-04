<?php
declare(strict_types=1);

namespace RiverReady\Services;

// Tiny file cache for EA responses. One JSON file per URL; failures are never stored.
final class EaCache
{
    private string $dir;
    private int $ttl;

    public function __construct(string $dir, int $ttl)
    {
        $this->dir = $dir;
        $this->ttl = $ttl;
    }

    /** @return array{data: mixed, fetchedAt: int}|null  null when missing, expired or unreadable */
    public function get(string $url): ?array
    {
        $file = $this->path($url);
        if ($this->ttl <= 0 || !is_file($file) || time() - (int) @filemtime($file) > $this->ttl) {
            return null;
        }
        $raw = @file_get_contents($file);
        $entry = $raw === false ? null : json_decode($raw, true);
        return is_array($entry) && isset($entry['fetchedAt']) && array_key_exists('data', $entry) ? $entry : null;
    }

    /** Best effort: if the directory is not writable the app simply works without a cache. */
    public function put(string $url, $data): void
    {
        if ($this->ttl <= 0 || (!is_dir($this->dir) && !@mkdir($this->dir, 0775, true) && !is_dir($this->dir))) {
            return;
        }
        $tmp = $this->path($url) . '.' . bin2hex(random_bytes(4)) . '.tmp';
        $json = json_encode(['fetchedAt' => time(), 'data' => $data]);
        // Write to a temp file then rename, so a reader never sees half a file.
        if ($json !== false && @file_put_contents($tmp, $json) !== false) {
            @rename($tmp, $this->path($url));
        }
        @unlink($tmp);
    }

    private function path(string $url): string
    {
        return rtrim($this->dir, '/\\') . '/ea_' . sha1($url) . '.json';
    }
}
