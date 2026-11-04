<?php
declare(strict_types=1);

namespace RiverReady\Http;

// Single place that writes JSON responses, so every endpoint has the same shape.
final class Response
{
    /** @param mixed $body */
    public static function json(int $status, $body = null, array $headers = []): void
    {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        foreach ($headers as $name => $value) {
            header($name . ': ' . $value);
        }
        // 204 No Content must not have a body
        if ($status !== 204 && $body !== null) {
            echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        }
    }

    /** Error shape from CLAUDE.md section 5. Never pass SQL, paths or config in $message. */
    public static function error(
        int $status,
        string $code,
        string $message,
        ?array $fields = null,
        array $headers = []
    ): void {
        $error = ['code' => $code, 'message' => $message];
        if ($fields !== null) {
            $error['fields'] = $fields;
        }
        self::json($status, ['error' => $error], $headers);
    }
}
