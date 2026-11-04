<?php
declare(strict_types=1);

namespace RiverReady\Http;

// Minimal router: exact method + path match, with {name} placeholders.
final class Router
{
    /** @var array<int, array{method:string, regex:string, handler:callable}> */
    private array $routes = [];

    public function add(string $method, string $pattern, callable $handler): void
    {
        // "/api/locations/{id}" -> "#^/api/locations/(?P<id>[^/]+)$#"
        $regex = preg_replace('#\{(\w+)\}#', '(?P<$1>[^/]+)', $pattern);
        $this->routes[] = [
            'method'  => strtoupper($method),
            'regex'   => '#^' . $regex . '$#',
            'handler' => $handler,
        ];
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = '/' . trim($path, '/');
        $allowed = [];

        foreach ($this->routes as $route) {
            if (!preg_match($route['regex'], $path, $matches)) {
                continue;
            }
            if ($route['method'] === $method) {
                // Keep only named captures (the {id} style params)
                $params = array_filter($matches, 'is_string', ARRAY_FILTER_USE_KEY);
                try {
                    ($route['handler'])($params);
                } catch (ApiException $e) {
                    // Expected client error: safe message only
                    Response::error($e->status(), $e->errorCode(), $e->getMessage(), $e->fields());
                }
                return;
            }
            $allowed[] = $route['method'];
        }

        // Path exists but not for this method -> 405 + Allow header
        if ($allowed) {
            $allow = implode(', ', array_unique($allowed));
            Response::error(405, 'METHOD_NOT_ALLOWED', 'Method not allowed for this endpoint.', null, ['Allow' => $allow]);
            return;
        }

        Response::error(404, 'NOT_FOUND', 'Endpoint not found.');
    }
}
