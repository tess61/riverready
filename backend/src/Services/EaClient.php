<?php
declare(strict_types=1);

namespace RiverReady\Services;

// Talks to the EA Flood Monitoring API. Never throws: every call returns
// ['status' => ok|empty|not_found|unavailable|timeout, 'data' => ..., 'fetchedAt' => ISO time|null].
final class EaClient
{
    private string $base;
    private int $connectTimeout;
    private int $timeout;
    private EaCache $cache;

    public function __construct(array $cfg)
    {
        $this->base           = rtrim((string) ($cfg['base_url'] ?? 'https://environment.data.gov.uk/flood-monitoring'), '/');
        $this->connectTimeout = (int) ($cfg['connect_timeout'] ?? 3);
        $this->timeout        = (int) ($cfg['timeout'] ?? 6);
        $this->cache          = new EaCache((string) ($cfg['cache_dir'] ?? sys_get_temp_dir() . '/riverready_cache'), (int) ($cfg['cache_ttl'] ?? 300));
    }

    /** Station search. EA search is case-sensitive, so a lowercase term is title-cased ("colwick" -> "Colwick"). */
    public function searchStations(string $term, int $limit): array
    {
        if ($term === strtolower($term)) {
            $term = ucwords($term);
        }
        $r = $this->fetch('/id/stations', ['search' => $term, '_limit' => $limit]);
        if ($r['status'] !== 'ok') {
            return $r;
        }
        $items = EaNormaliser::stationList($r['data']);
        return ['status' => $items === [] ? 'empty' : 'ok', 'data' => $items, 'fetchedAt' => $r['fetchedAt']];
    }

    /** One station with its measures and latest readings (EA embeds latestReading in the station). */
    public function station(string $ref): array
    {
        $r = $this->fetch('/id/stations/' . rawurlencode($ref));
        if ($r['status'] !== 'ok') {
            return $r;
        }
        $station = EaNormaliser::station($r['data']['items'] ?? null);
        if ($station === null) {
            return ['status' => 'not_found', 'data' => null, 'fetchedAt' => $r['fetchedAt']];
        }
        $hasLatest = array_filter($station['measures'], static fn (array $m) => $m['latest'] !== null);
        return ['status' => $hasLatest ? 'ok' : 'empty', 'data' => $station, 'fetchedAt' => $r['fetchedAt']];
    }

    /** Recent readings of ONE measure, oldest first, for the trend sparkline. */
    public function readings(string $measureId, int $hours): array
    {
        // `since` limits to the window; 100 rows covers 24h of 15-minute readings.
        $r = $this->fetch('/id/measures/' . rawurlencode($measureId) . '/readings', [
            'since'   => gmdate('Y-m-d\TH:i:s\Z', time() - $hours * 3600),
            '_sorted' => '',
            '_limit'  => 100 * (int) ceil($hours / 24),
        ]);
        if ($r['status'] !== 'ok') {
            return $r;
        }
        $points = EaNormaliser::readings($r['data']);
        return ['status' => $points === [] ? 'empty' : 'ok', 'data' => $points, 'fetchedAt' => $r['fetchedAt']];
    }

    /** Cached GET + JSON decode. Only successful responses are cached. */
    private function fetch(string $path, array $query = []): array
    {
        $url = $this->base . $path . ($query ? '?' . http_build_query($query) : '');

        $hit = $this->cache->get($url);
        if ($hit !== null) {
            return $this->result('ok', $hit['data'], $hit['fetchedAt']);
        }

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_CONNECTTIMEOUT => $this->connectTimeout,
            CURLOPT_TIMEOUT        => $this->timeout,
            CURLOPT_HTTPHEADER     => ['Accept: application/json'],
            CURLOPT_USERAGENT      => 'RiverReady-student-project',
        ]);
        $body  = curl_exec($ch);
        $errno = curl_errno($ch);
        // (no curl_close: the handle is freed automatically; the function is deprecated in PHP 8.5)
        $code  = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

        if ($errno !== 0 || !is_string($body)) {
            error_log("[riverready] EA request failed (curl errno $errno) for $path");
            return $this->result($errno === CURLE_OPERATION_TIMEDOUT ? 'timeout' : 'unavailable');
        }
        if ($code === 404) {
            return $this->result('not_found');
        }
        $data = $code === 200 ? json_decode($body, true) : null;
        if (!is_array($data)) {
            error_log("[riverready] EA bad response (HTTP $code) for $path");
            return $this->result('unavailable');
        }
        $this->cache->put($url, $data);
        return $this->result('ok', $data, time());
    }

    private function result(string $status, $data = null, ?int $at = null): array
    {
        return ['status' => $status, 'data' => $data, 'fetchedAt' => $at === null ? null : gmdate('c', $at)];
    }
}
