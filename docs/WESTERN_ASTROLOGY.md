# Western Astrology Foundation

> **Added**: 2026-05-14  
> **Source**: `backendjs/src/western/`  
> **Confidence**: `basic` — for personality context, NOT professional astrological prediction.

---

## Scope

This module provides a lightweight Western zodiac reference layer alongside the existing BaZi engine. It is:

- **Additive** — does not affect BaZi calculations
- **Isolated** — completely independent from `backendjs/src/bazi/`
- **Non-predictive** — personality traits only, no fate/fortune claims
- **Basic confidence** — explicitly noted in every response

## What Is Implemented

| Feature | Accuracy | Implementation |
|---------|:--------:|----------------|
| **Sun sign** | ✅ Accurate (±1 day cusp handling) | `signs/sun.js` — pure date-based calculation |
| **Moon sign** | ⚠️ Approximate (±1 sign) | `signs/moon.js` — simplified cycle from 2000-01-01 reference |
| **Personality traits** | ✅ Static mapping | `utils/personality.js` — 5 traits per sign + communication + emotion |
| **Element analysis** | ✅ From sun + moon | Fire/Earth/Air/Water distribution |
| **Modality** | ✅ Static | Cardinal/Fixed/Mutable per sign |

## What Is Intentionally Excluded

| Feature | Reason |
|---------|--------|
| **Rising sign (Ascendant)** | Requires exact birth time + birth location (latitude/longitude). Out of scope for this foundation. |
| **Houses** | Requires rising sign + complex house system calculation. |
| **Transits** | Requires ephemeris data. Not a transit calculator. |
| **Progressions** | Requires advanced ephemeris calculations. |
| **Synastry (compatibility)** | Requires full chart comparison. Not implemented. |
| **Predictive statements** | The module does NOT generate predictions or fortune-telling outputs. |

## Integration with BaZi Layer

The Western astrology module runs alongside the BaZi engine at the `output.js` formatting stage.

```
ctx (BaZi chart context)
  → western.analyze(year, month, day, hour)
  → added as response.western_astrology
  → completely separate from BaZI fields
```

**No cross-referencing** between BaZi and Western data occurs in this version.

## Data Flow

```
HTTP Request
  → calculator.js (BaZi)              (independent)
  → output.js                          (merging point)
    → western.analyze()                (new, additive)
    → response.western_astrology       (new field)
    → response.phan_tich (BaZi)       (unchanged)
    → response.luan_giai (BaZi)       (unchanged)
```

## API Response Shape

```json
{
  "western_astrology": {
    "_confidence": "basic",
    "_disclaimer": "This is a basic Western astrology reference...",
    "sun_sign": {
      "id": "gemini",
      "name": "Gemini",
      "nameVN": "Song Tử",
      "symbol": "♊",
      "element": "Air",
      "personality": {
        "traits": ["Adaptable", "Curious", "Communicative", ...],
        "traitsVN": ["Linh hoạt", "Tò mò", "Giao tiếp tốt", ...],
        "communication": "Quick-witted and versatile...",
        "communicationVN": "Nhanh trí và linh hoạt...",
        "emotion": "Intellectually processes emotions...",
        "emotionVN": "Xử lý cảm xúc bằng lý trí..."
      }
    },
    "moon_sign": {
      "id": "capricorn",
      "name": "Capricorn",
      "nameVN": "Ma Kết",
      "symbol": "♑",
      "element": "Earth",
      "_confidence": "low",
      "_warning": "Approximate calculation ±1 sign..."
    },
    "rising_sign": null,
    "_risingNote": "Rising sign requires birth location...",
    "elements": [
      { "element": "Earth", "count": 1, "percentage": 50 },
      { "element": "Air", "count": 1, "percentage": 50 }
    ],
    "summary": {
      "text": "Sun in Gemini (Air). Moon in Capricorn (Earth). Dominant element: Earth.",
      "textVN": "Mặt Trời ở Song Tử (Air). Mặt Trăng ở Ma Kết (Earth). Nguyên tố chủ đạo: Earth.",
      "components": ["Sun in Gemini (Air)", "Moon in Capricorn (Earth)", "Dominant element: Earth"]
    }
  }
}
```

## Backward Compatibility

| Field | Before | After | Status |
|-------|--------|-------|:------:|
| All BaZi fields | Present | Present | ✅ Unchanged |
| `western_astrology` | Missing | Added | ✅ New (additive) |
| `structured_interpretations` | Present | Present | ✅ Unchanged |
| API response shape | Stable | Extended | ✅ No breaking changes |

## Moon Sign Caveat

The moon sign is calculated using a simplified algorithm:
- Reference: Moon was approximately in **Virgo** on 2000-01-01 UTC
- Moon moves ~1 sign every 2.277 days
- **Accuracy: ±1 sign** — sufficient for basic personality context, **NOT** for professional astrological work

For production-quality moon signs, integrate [Swiss Ephemeris](https://www.astro.com/swisseph/) or a similar ephemeris library.

## Tests

| File | Tests | What It Validates |
|------|:-----:|-------------------|
| `tests/western.test.js` | 25 | Sun sign (all 12 signs + boundaries + invalid), moon sign (valid + confidence + determinism), analyze() (structure + famous people), personality (all 12 signs) |
| `tests/core.test.js` | 68 | Unchanged — BaZi engine still validated |
| `tests/api-contract.test.js` | 43 | Unchanged — API contract tests will automatically validate `western_astrology` field exists in future runs |

## Frontend Page

| Aspect | Detail |
|--------|--------|
| **Route** | `/tuviphuongtay` |
| **Page component** | `frontend/src/features/WesternAstrology/WesternPage.jsx` |
| **Desktop tab** | "TỬ VI TÂY" (⭐) in `DesktopShell.jsx` tab list |
| **Mobile tab** | "TỬ VI TÂY" (⭐) in `MobileShell.jsx` header nav |

### UI Cards

1. **Ba ngôi sao chính** — Sun (accurate), Moon (with ⚠️ warning), Rising (placeholder — "Cần nơi sinh")
2. **Nguyên tố nổi bật** — Visual element distribution bars with Vietnamese labels
3. **Gợi ý tính cách** — Traits tags, communication style, emotional tendency, backend summary, full disclaimer

### Data Flow

```
userData (inputParams) → WesternPage reads sessionStorage('bazi_data')
                         → extracts western_astrology from API response
                         → renders 3 cards
```

No additional API calls. No client-side astrology calculation.

### Limitations Displayed in UI

- ⚠️ Moon sign uses approximate algorithm (±1 sign)
- ⚠️ Rising sign requires birth location (not available)
- ⚠️ Disclaimer in page header: "Kết quả chỉ mang tính tham khảo"

## Future Extension Points

1. **Rising sign**: Implement when birth location data is available. Requires house system math.
2. **Cross-reference**: Map Western elements (Fire/Earth/Air/Water) to BaZi elements (Kim/Mộc/Thủy/Hỏa/Thổ) for hybrid interpretation.
3. **Chinese zodiac vs Western**: Compare BaZi year branch animal with Western sun sign.
4. **Full chart**: Add planet positions from Swiss Ephemeris.
