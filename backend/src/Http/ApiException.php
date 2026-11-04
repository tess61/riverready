<?php
declare(strict_types=1);

namespace RiverReady\Http;

// Thrown by controllers/helpers for expected client errors (400, 404, 422...).
// The Router catches it and writes the standard JSON error. Unexpected errors
// (PDO etc.) are NOT this type and fall through to the generic 500 handler.
final class ApiException extends \RuntimeException
{
    private string $errorCode;
    private ?array $fields;

    public function __construct(int $status, string $errorCode, string $message, ?array $fields = null)
    {
        parent::__construct($message, $status);
        $this->errorCode = $errorCode;
        $this->fields = $fields;
    }

    public function status(): int
    {
        return $this->getCode();
    }

    public function errorCode(): string
    {
        return $this->errorCode;
    }

    public function fields(): ?array
    {
        return $this->fields;
    }
}
