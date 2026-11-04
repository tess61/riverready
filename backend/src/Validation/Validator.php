<?php
declare(strict_types=1);

namespace RiverReady\Validation;

// Collects per-field errors so the API can return them in "fields".
// Each check skips empty optional values; call required() first where needed.
final class Validator
{
    /** @var array<string,string> */
    private array $errors = [];

    public function required(string $field, $value): self
    {
        if ($value === null || (is_string($value) && trim($value) === '')) {
            $this->errors[$field] = 'required';
        }
        return $this;
    }

    public function maxLength(string $field, $value, int $max, int $min = 0): self
    {
        if ($value === null || isset($this->errors[$field])) {
            return $this;
        }
        if (!is_string($value)) {
            $this->errors[$field] = 'must be text';
            return $this;
        }
        $len = mb_strlen(trim($value)); // mb_ so accented characters count as 1
        if ($len > $max) {
            $this->errors[$field] = "must be at most $max characters";
        } elseif ($len < $min) {
            $this->errors[$field] = "must be at least $min characters";
        }
        return $this;
    }

    /** Value must be one of $allowed (strict). */
    public function enum(string $field, $value, array $allowed): self
    {
        if ($value !== null && !isset($this->errors[$field]) && !in_array($value, $allowed, true)) {
            $this->errors[$field] = 'must be one of: ' . implode(', ', $allowed);
        }
        return $this;
    }

    /** Strict Y-m-d check; rejects 2026-02-30 by round-tripping. */
    public function date(string $field, $value): self
    {
        if ($value === null || isset($this->errors[$field])) {
            return $this;
        }
        $d = is_string($value) ? \DateTimeImmutable::createFromFormat('!Y-m-d', $value) : false;
        if (!$d || $d->format('Y-m-d') !== $value) {
            $this->errors[$field] = 'must be a valid date (YYYY-MM-DD)';
        }
        return $this;
    }

    /** true/false or 0/1 (used for is_done). */
    public function boolean(string $field, $value): self
    {
        if ($value !== null && !isset($this->errors[$field]) && !in_array($value, [true, false, 0, 1], true)) {
            $this->errors[$field] = 'must be true or false';
        }
        return $this;
    }

    /** Positive integer; accepts ints or digit-only strings (URL params). */
    public function positiveInt(string $field, $value): self
    {
        $ok = (is_int($value) && $value > 0)
            || (is_string($value) && ctype_digit($value) && (int) $value > 0);
        if (!$ok) {
            $this->errors[$field] = 'must be a positive integer';
        }
        return $this;
    }

    public function pattern(string $field, $value, string $regex, string $message): self
    {
        if ($value !== null && !isset($this->errors[$field])
            && (!is_string($value) || !preg_match($regex, $value))) {
            $this->errors[$field] = $message;
        }
        return $this;
    }

    public function fails(): bool
    {
        return $this->errors !== [];
    }

    /** @return array<string,string> */
    public function errors(): array
    {
        return $this->errors;
    }
}
