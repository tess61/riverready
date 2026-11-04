<?php
// Standalone deployment check: upload to nuwebspace, open in a browser, then DELETE it.
// Makes ONE outbound request to the EA stations endpoint. Contains no secrets.
header('Content-Type: application/json');

$result = [
    'php_version'       => PHP_VERSION,
    'curl_enabled'      => function_exists('curl_init'),
    'pdo_mysql_enabled' => extension_loaded('pdo_mysql'),
    'ea_status'         => 'unavailable',
    'http_code'         => null,
    'error'             => null,
];

if ($result['curl_enabled']) {
    $ch = curl_init('https://environment.data.gov.uk/flood-monitoring/id/stations?_limit=1');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => false,
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT        => 6,
        CURLOPT_USERAGENT      => 'RiverReady-student-project',
    ]);
    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $result['http_code'] = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    if ($errno !== 0) {
        $result['ea_status'] = $errno === CURLE_OPERATION_TIMEDOUT ? 'timeout' : 'unavailable';
        $result['error'] = curl_error($ch);
    } elseif ($result['http_code'] === 200 && is_array(json_decode((string) $body, true))) {
        $result['ea_status'] = 'ok';
    } else {
        $result['error'] = 'Unexpected response from EA';
    }
}

echo json_encode($result, JSON_PRETTY_PRINT);
