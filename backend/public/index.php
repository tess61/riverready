<?php
declare(strict_types=1);

// Front controller: every request lands here (via .htaccess or `php -S ... index.php`).

use RiverReady\Controllers\ActionController;
use RiverReady\Controllers\LocationController;
use RiverReady\Controllers\OverviewController;
use RiverReady\Controllers\StationController;
use RiverReady\Http\Response;
use RiverReady\Http\Router;
use RiverReady\Repositories\ActionRepository;
use RiverReady\Repositories\LocationRepository;
use RiverReady\Services\EaClient;

// Tiny PSR-4 style autoloader: RiverReady\Http\Router -> src/Http/Router.php
spl_autoload_register(static function (string $class): void {
    $prefix = 'RiverReady\\';
    if (strncmp($class, $prefix, strlen($prefix)) === 0) {
        $file = __DIR__ . '/../src/' . str_replace('\\', '/', substr($class, strlen($prefix))) . '.php';
        if (is_file($file)) {
            require $file;
        }
    }
});

// Never show PHP errors to clients; log them instead.
ini_set('display_errors', '0');
error_reporting(E_ALL);

// Turn warnings/notices into exceptions so they hit the handler below.
set_error_handler(static function (int $no, string $msg, string $file, int $line): bool {
    if (!(error_reporting() & $no)) {
        return false;
    }
    throw new ErrorException($msg, 0, $no, $file, $line);
});

// Global handler: full detail goes to the server log, client gets a generic 500.
set_exception_handler(static function (Throwable $e): void {
    error_log(sprintf('[riverready] %s: %s in %s:%d', get_class($e), $e->getMessage(), $e->getFile(), $e->getLine()));
    if (!headers_sent()) {
        Response::error(500, 'SERVER_ERROR', 'Something went wrong. Please try again later.');
    }
});

/** Lazy, cached read of config/config.php (only touched when something needs it). */
function config(): array
{
    static $cfg = null;
    if ($cfg === null) {
        $path = __DIR__ . '/../config/config.php';
        if (!is_file($path)) {
            throw new RuntimeException('config/config.php is missing');
        }
        $cfg = require $path;
    }
    return $cfg;
}

/** EA settings from config. Env vars let me simulate failures without editing config (e.g. a bad host). */
function eaConfig(): array
{
    $ea = config()['ea'] ?? [];
    foreach (['base_url' => 'RIVERREADY_EA_BASE_URL', 'timeout' => 'RIVERREADY_EA_TIMEOUT', 'connect_timeout' => 'RIVERREADY_EA_CONNECT_TIMEOUT'] as $key => $env) {
        if (getenv($env) !== false && getenv($env) !== '') {
            $ea[$key] = getenv($env);
        }
    }
    return $ea;
}

/** Lazy shared PDO connection. */
function db(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $c = config()['db'];
        $pdo = new PDO(
            "mysql:host={$c['host']};dbname={$c['name']};charset=utf8mb4",
            $c['user'],
            $c['pass'],
            [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES   => false, // real prepared statements
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]
        );
    }
    return $pdo;
}

$router = new Router();

$router->add('GET', '/api/health', static function (): void {
    try {
        db()->query('SELECT 1'); // constant query, no user input
    } catch (Throwable $e) {
        error_log('[riverready] health check DB failure: ' . get_class($e) . ': ' . $e->getMessage());
        Response::error(503, 'DB_UNAVAILABLE', 'Database is unavailable.');
        return;
    }
    Response::json(200, ['status' => 'ok', 'database' => 'ok', 'time' => gmdate('c')]);
});

// Controllers are built lazily inside the closures so DB config is only read when needed.
$locations = static fn () => new LocationController(new LocationRepository(db()));
$actions   = static fn () => new ActionController(new ActionRepository(db()), new LocationRepository(db()));

$router->add('GET',    '/api/locations',                 static fn (array $p) => $locations()->index($p));
$router->add('POST',   '/api/locations',                 static fn (array $p) => $locations()->store($p));
$router->add('GET',    '/api/locations/{id}',            static fn (array $p) => $locations()->show($p));
$router->add('PUT',    '/api/locations/{id}',            static fn (array $p) => $locations()->update($p));
$router->add('DELETE', '/api/locations/{id}',            static fn (array $p) => $locations()->destroy($p));
$router->add('GET',    '/api/locations/{id}/actions',    static fn (array $p) => $actions()->index($p));
$router->add('POST',   '/api/locations/{id}/actions',    static fn (array $p) => $actions()->store($p));
$router->add('PUT',    '/api/actions/{id}',              static fn (array $p) => $actions()->update($p));
$router->add('DELETE', '/api/actions/{id}',              static fn (array $p) => $actions()->destroy($p));

$ea       = static fn () => new EaClient(eaConfig());
$stations = static fn () => new StationController($ea());
$overview = static fn () => new OverviewController(new LocationRepository(db()), new ActionRepository(db()), $ea());

$router->add('GET', '/api/stations',                    static fn (array $p) => $stations()->search($p));
$router->add('GET', '/api/stations/{ref}',              static fn (array $p) => $stations()->show($p));
$router->add('GET', '/api/locations/{id}/overview',     static fn (array $p) => $overview()->show($p));

// Route path: everything from "/api" onward, so it works under any sub-folder on the host.
$uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$pos = strpos($uri, '/api');
$router->dispatch($_SERVER['REQUEST_METHOD'] ?? 'GET', $pos === false ? $uri : substr($uri, $pos));
