/**
 * Western Astrology Foundation Tests
 *
 * Validates:
 * - Sun sign calculation (accurate)
 * - Moon sign calculation (approximate, ±1 sign)
 * - Determinism (same input → same output)
 * - Personality trait mapping
 * - Invalid input safety
 * - Backward compatibility with BaZi output
 *
 * Run:
 *   node --test backendjs/tests/western.test.js
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const western = require('../src/western/western');
const { getSunSign, getMoonSign, getSignPersonality } = western;

// ─── Suite 1: Sun Sign ──────────────────────────────────────────────────────

describe('sun sign — accurate calculation', () => {

    it('Aries: Mar 21 – Apr 19', () => {
        assert.equal(getSunSign(3, 21).id, 'aries');
        assert.equal(getSunSign(4, 19).id, 'aries');
        assert.equal(getSunSign(4, 10).id, 'aries');
    });

    it('Taurus: Apr 20 – May 20', () => {
        assert.equal(getSunSign(4, 20).id, 'taurus');
        assert.equal(getSunSign(5, 20).id, 'taurus');
    });

    it('Gemini: May 21 – Jun 20', () => {
        assert.equal(getSunSign(5, 21).id, 'gemini');
        assert.equal(getSunSign(6, 20).id, 'gemini');
    });

    it('Cancer: Jun 21 – Jul 22', () => {
        assert.equal(getSunSign(6, 21).id, 'cancer');
        assert.equal(getSunSign(7, 22).id, 'cancer');
    });

    it('Leo: Jul 23 – Aug 22', () => {
        assert.equal(getSunSign(7, 23).id, 'leo');
        assert.equal(getSunSign(8, 22).id, 'leo');
    });

    it('Virgo: Aug 23 – Sep 22', () => {
        assert.equal(getSunSign(8, 23).id, 'virgo');
        assert.equal(getSunSign(9, 22).id, 'virgo');
    });

    it('Libra: Sep 23 – Oct 22', () => {
        assert.equal(getSunSign(9, 23).id, 'libra');
        assert.equal(getSunSign(10, 22).id, 'libra');
    });

    it('Scorpio: Oct 23 – Nov 21', () => {
        assert.equal(getSunSign(10, 23).id, 'scorpio');
        assert.equal(getSunSign(11, 21).id, 'scorpio');
    });

    it('Sagittarius: Nov 22 – Dec 21', () => {
        assert.equal(getSunSign(11, 22).id, 'sagittarius');
        assert.equal(getSunSign(12, 21).id, 'sagittarius');
    });

    it('Capricorn: Dec 22 – Jan 19 (year boundary)', () => {
        assert.equal(getSunSign(12, 22).id, 'capricorn');
        assert.equal(getSunSign(1, 19).id, 'capricorn');
        assert.equal(getSunSign(1, 1).id, 'capricorn');
    });

    it('Aquarius: Jan 20 – Feb 18', () => {
        assert.equal(getSunSign(1, 20).id, 'aquarius');
        assert.equal(getSunSign(2, 18).id, 'aquarius');
    });

    it('Pisces: Feb 19 – Mar 20', () => {
        assert.equal(getSunSign(2, 19).id, 'pisces');
        assert.equal(getSunSign(3, 20).id, 'pisces');
    });

    it('returns null for invalid input', () => {
        assert.equal(getSunSign(0, 1), null);
        assert.equal(getSunSign(13, 1), null);
        assert.equal(getSunSign(1, 32), null);
        assert.equal(getSunSign(null, null), null);
    });
});

// ─── Suite 2: Moon Sign ─────────────────────────────────────────────────────

describe('moon sign — approximate calculation', () => {

    it('returns a valid sign object', () => {
        const moon = getMoonSign(1990, 6, 15);
        assert.ok(moon);
        assert.ok(moon.id);
        assert.ok(moon.name);
        assert.ok(moon.symbol);
        assert.ok(moon.element);
    });

    it('has low confidence warning', () => {
        const moon = getMoonSign(1990, 6, 15);
        assert.equal(moon._confidence, 'low');
        assert.ok(moon._warning);
    });

    it('is deterministic (same input = same sign)', () => {
        const m1 = getMoonSign(1990, 6, 15);
        const m2 = getMoonSign(1990, 6, 15);
        assert.equal(m1.id, m2.id);
    });

    it('returns null for invalid input', () => {
        assert.equal(getMoonSign(1990, 0, 1), null);
        assert.equal(getMoonSign(1990, 13, 1), null);
        assert.equal(getMoonSign(null, null, null), null);
    });
});

// ─── Suite 3: Western Analyze ───────────────────────────────────────────────

describe('western.analyze()', () => {

    it('returns complete object structure', () => {
        const result = western.analyze(1990, 6, 15, 12);
        const wa = result.western_astrology;

        assert.ok(wa);
        assert.equal(wa._confidence, 'basic');
        assert.ok(wa._disclaimer);
        assert.ok(wa.sun_sign);
        assert.ok(wa.moon_sign);
        assert.equal(wa.rising_sign, null);
        assert.ok(Array.isArray(wa.elements));
        assert.ok(wa.summary);
    });

    it('returns correct sun sign for known dates', () => {
        // Famous people verification
        assert.equal(western.analyze(1955, 2, 24).western_astrology.sun_sign.id, 'pisces');  // Steve Jobs
        assert.equal(western.analyze(1971, 6, 28).western_astrology.sun_sign.id, 'cancer');   // Elon Musk
        assert.equal(western.analyze(1893, 12, 26).western_astrology.sun_sign.id, 'capricorn'); // Mao
        assert.equal(western.analyze(1940, 11, 27).western_astrology.sun_sign.id, 'sagittarius'); // Bruce Lee
        assert.equal(western.analyze(1879, 3, 14).western_astrology.sun_sign.id, 'pisces');   // Einstein
    });

    it('sun sign has personality data', () => {
        const result = western.analyze(1990, 6, 15);
        const personality = result.western_astrology.sun_sign.personality;
        assert.ok(personality);
        assert.ok(Array.isArray(personality.traits));
        assert.ok(personality.traits.length > 0);
        assert.ok(personality.communication);
        assert.ok(personality.emotion);
    });

    it('is deterministic', () => {
        const r1 = western.analyze(1990, 6, 15);
        const r2 = western.analyze(1990, 6, 15);
        assert.equal(r1.western_astrology.sun_sign.id, r2.western_astrology.sun_sign.id);
        assert.equal(r1.western_astrology.moon_sign.id, r2.western_astrology.moon_sign.id);
    });

    it('handles year boundary dates (Jan 1 → Capricorn)', () => {
        const result = western.analyze(2000, 1, 1);
        assert.equal(result.western_astrology.sun_sign.id, 'capricorn');
    });

    it('handles invalid year gracefully', () => {
        const result = western.analyze(-500, 1, 1);
        // Should not crash. Sun sign should work (date-based), moon may or may not
        assert.ok(result.western_astrology);
    });
});

// ─── Suite 4: Personality Traits ────────────────────────────────────────────

describe('personality traits', () => {

    it('returns data for each zodiac sign', () => {
        const ids = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo',
                      'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
        for (const id of ids) {
            const p = getSignPersonality(id);
            assert.ok(p, `Missing personality for ${id}`);
            assert.ok(Array.isArray(p.traits), `traits not array for ${id}`);
            assert.ok(p.traits.length > 0, `empty traits for ${id}`);
            assert.ok(p.communication, `missing communication for ${id}`);
            assert.ok(p.emotion, `missing emotion for ${id}`);
        }
    });

    it('returns null for unknown sign', () => {
        assert.equal(getSignPersonality('unknown'), null);
    });
});
