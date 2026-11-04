<?php
// Copy this file to config.php and fill in the real values.
// config.php is gitignored and must never appear in errors, zips or screenshots.
return [
    'db' => [
        'host' => 'localhost',
        'name' => 'riverready',
        'user' => 'riverready',
        'pass' => 'CHANGE_ME',
    ],
    'ea' => [
        'base_url'        => 'https://environment.data.gov.uk/flood-monitoring',
        'connect_timeout' => 3,   // seconds
        'timeout'         => 6,   // seconds
        'cache_ttl'       => 300, // seconds (~5 min; EA updates about every 15 min)
        // Writable directory for the EA file cache (used from Phase 3)
        'cache_dir'       => sys_get_temp_dir() . '/riverready_cache',
    ],
    // Allowed browser origin for local dev only (Vite). Leave '' in production (same origin).
    'cors_origin' => '',
];
