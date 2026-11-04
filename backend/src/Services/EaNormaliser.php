<?php
declare(strict_types=1);

namespace RiverReady\Services;

// Turns EA JSON into our own small shape. Assumes nothing: every field may be missing,
// `measures` may be one object or a list (or a URL string), `value` may be an array.
final class EaNormaliser
{
    /** @return list<array> */
    public static function stationList($json): array
    {
        $out = [];
        foreach (self::asList(is_array($json) ? ($json['items'] ?? null) : null) as $item) {
            $s = self::station($item);
            if ($s !== null) {
                $out[] = $s;
            }
        }
        return $out;
    }

    /** One EA station object -> our shape, or null if it has no usable reference. */
    public static function station($s): ?array
    {
        if (!is_array($s) || self::text($s['stationReference'] ?? null) === null) {
            return null;
        }
        // stageScale is an object on the detail endpoint but only a URL string in lists.
        $scale = is_array($s['stageScale'] ?? null) ? $s['stageScale'] : [];
        $measures = [];
        foreach (self::asList($s['measures'] ?? null) as $m) {
            $measures[] = self::measure($m, $scale);
        }
        return [
            'reference' => self::text($s['stationReference']),
            'label'     => self::text($s['label'] ?? null),
            'river'     => self::text($s['riverName'] ?? null),
            'town'      => self::text($s['town'] ?? null),
            'measures'  => $measures,
        ];
    }

    private static function measure($m, array $scale): array
    {
        if (is_string($m)) { // bare URL: all we can get is the id
            $m = ['@id' => $m];
        }
        $m = is_array($m) ? $m : [];
        $id = self::text(basename((string) ($m['@id'] ?? '')));
        $qualifier = self::text($m['qualifier'] ?? null);
        $latest = is_array($m['latestReading'] ?? null) ? $m['latestReading'] : null;
        $value = $latest === null ? null : self::number($latest['value'] ?? null);

        // The station's typical range describes its normal "Stage" level only,
        // so it is not attached to other measures (e.g. "Downstream Stage").
        $isStage = ($m['parameter'] ?? null) === 'level' && strtolower((string) $qualifier) === 'stage';
        $low  = $isStage ? self::number($scale['typicalRangeLow'] ?? null) : null;
        $high = $isStage ? self::number($scale['typicalRangeHigh'] ?? null) : null;

        return [
            'id'           => $id,
            'name'         => $qualifier ?? self::text($m['parameterName'] ?? null) ?? $id,
            'parameter'    => self::text($m['parameter'] ?? null),
            'unit'         => self::text($m['unitName'] ?? null),
            'typicalRange' => ($low !== null && $high !== null) ? ['low' => $low, 'high' => $high] : null,
            'latest'       => $value === null ? null : [
                'value'    => $value,
                'dateTime' => self::text($latest['dateTime'] ?? null),
            ],
        ];
    }

    /** EA returns one object where it has a single item and a list otherwise. */
    private static function asList($v): array
    {
        if (!is_array($v) || $v === []) {
            return [];
        }
        return array_is_list($v) ? $v : [$v];
    }

    /** Number, numeric string, or array of those (first numeric wins) -> float|null. */
    private static function number($v): ?float
    {
        foreach (is_array($v) ? $v : [$v] as $candidate) {
            if (is_int($candidate) || is_float($candidate) || (is_string($candidate) && is_numeric($candidate))) {
                return (float) $candidate;
            }
        }
        return null;
    }

    private static function text($v): ?string
    {
        return is_string($v) && trim($v) !== '' ? trim($v) : null;
    }
}
