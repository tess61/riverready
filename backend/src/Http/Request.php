<?php
declare(strict_types=1);

namespace RiverReady\Http;

use RiverReady\Validation\Validator;

// Helpers for reading the incoming request safely.
final class Request
{
    private const MAX_BODY_BYTES = 65536; // 64 KB is plenty for this API

    /** Read a positive-integer id from route params, or throw 422 with fields. */
    public static function id(array $params, string $name = 'id'): int
    {
        $v = (new Validator())->positiveInt($name, $params[$name] ?? null);
        if ($v->fails()) {
            throw new ApiException(422, 'VALIDATION_ERROR', 'Invalid id.', $v->errors());
        }
        return (int) $params[$name];
    }

    /**
     * Decode the JSON body into an associative array.
     * 415 if not JSON content-type, 413 if too big, 400 if empty/malformed/not an object.
     */
    public static function jsonBody(): array
    {
        $type = strtolower($_SERVER['CONTENT_TYPE'] ?? '');
        if (strpos($type, 'application/json') !== 0) {
            throw new ApiException(415, 'UNSUPPORTED_MEDIA_TYPE', 'Content-Type must be application/json.');
        }
        $raw = file_get_contents('php://input', false, null, 0, self::MAX_BODY_BYTES + 1);
        if ($raw === false || strlen($raw) > self::MAX_BODY_BYTES) {
            throw new ApiException(413, 'PAYLOAD_TOO_LARGE', 'Request body is too large.');
        }
        $raw = trim($raw);
        if ($raw === '') {
            throw new ApiException(400, 'BAD_REQUEST', 'Request body is empty.');
        }
        $data = json_decode($raw, true);
        // Must be a JSON object ("{...}"), not a list, string or number.
        if (json_last_error() !== JSON_ERROR_NONE || !is_array($data) || $raw[0] !== '{') {
            throw new ApiException(400, 'BAD_REQUEST', 'Request body must be a valid JSON object.');
        }
        return $data;
    }

    /** URL prefix before "/api" (empty locally, a sub-folder on some hosts). */
    public static function basePath(): string
    {
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
        $pos = strpos($uri, '/api');
        return $pos === false ? '' : substr($uri, 0, $pos);
    }
}
