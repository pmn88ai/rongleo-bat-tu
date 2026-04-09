/**
 * BaZi Service — Vercel serverless compatible
 * Identical logic to backendjs/src/services/bazi.service.js
 * Only change: require paths updated from ../bazi/ to ../bazi/ (same relative from lib/services/)
 */

'use strict';

const BaZiCalculator = require('../bazi/calculator');
const { formatOutput } = require('../bazi/output');
const { calculateDaiVan } = require('../bazi/dayun');
const thoiGianLuan = require('../bazi/thoi_gian_luan');
const ganzhi = require('../bazi/ganzhi');
const cacheService = require('./cache.service');

function isFemaleFromGender(gender) {
    const g = (gender || 'Nam').toLowerCase();
    return g === 'nữ' || g === 'nu' || g === 'female';
}

function isSolarFromCalendar(calendar) {
    return (calendar || 'solar').toLowerCase() === 'solar';
}

class BaZiService {

    async analyzeComplete(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'analyzeComplete' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour, minute: params.minute,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                return formatOutput(ctx, { name: params.name, includeAll: true });
            }
        );
    }

    async getBasicChart(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour, minute: params.minute,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return {
            pillars: fullData.chi_tiet_tru,
            elements: fullData.diem_so.ngu_hanh_vn,
            strength: fullData.diem_so.suc_manh,
            basicInfo: fullData.thong_tin_co_ban
        };
    }

    async getBasicInfo(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour, minute: params.minute,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        const fullData = formatOutput(ctx);
        return { thong_tin_co_ban: fullData.thong_tin_co_ban, tham_so_dau_vao: params };
    }

    async getPillars(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour, minute: params.minute,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        return { chi_tiet_tru: formatOutput(ctx).chi_tiet_tru };
    }

    async getAnalysis(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'getAnalysis' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour, minute: params.minute,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                return { phan_tich: formatOutput(ctx).phan_tich };
            }
        );
    }

    async getAdvanced(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'getAdvanced' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour, minute: params.minute,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                return { phan_tich_nang_cao: formatOutput(ctx).phan_tich.phan_tich_nang_cao };
            }
        );
    }

    async getClassicTexts(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour, minute: params.minute,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        return { van_ban_co_dien: formatOutput(ctx).van_ban_co_dien };
    }

    async getLuanGiai(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'getLuanGiai' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour, minute: params.minute,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                return { luan_giai: formatOutput(ctx).luan_giai };
            }
        );
    }

    async getElements(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        return { diem_so: formatOutput(ctx).diem_so };
    }

    async getStars(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        return { sao_dac_biet: formatOutput(ctx).phan_tich.than_sat_sao };
    }

    async getLuckCycles(params) {
        const calc = new BaZiCalculator({
            year: params.year, month: params.month, day: params.day,
            hour: params.hour,
            isFemale: isFemaleFromGender(params.gender),
            isSolar: isSolarFromCalendar(params.calendar)
        });
        const ctx = calc.calculate();
        return { dai_van: formatOutput(ctx).dai_van };
    }

    async getYearAnalysis(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'getYearAnalysis' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                const targetYear = params.targetYear || new Date().getFullYear();
                const luuNien = thoiGianLuan.analyzeLiuNian(ctx, targetYear);
                return Object.assign(
                    { nam_xem: targetYear, ganzhiVN: ganzhi.ganToVN(ctx.gans[0]) + ' ' + ganzhi.zhiToVN(ctx.zhis[0]) },
                    luuNien
                );
            }
        );
    }

    async getAuspiciousDates(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'getAuspiciousDates' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour || 12,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                const result = thoiGianLuan.analyzeAuspiciousDates(ctx, params.targetYear, params.targetMonth, params.activity || 'general');
                return { nam: params.targetYear, thang: params.targetMonth, lich_thang: result, activity: params.activity };
            }
        );
    }

    async analyzeTimeStatus(params) {
        return cacheService.getOrSet(
            cacheService.generateKey(Object.assign({ method: 'analyzeTimeStatus' }, params)),
            async function() {
                const calc = new BaZiCalculator({
                    year: params.year, month: params.month, day: params.day,
                    hour: params.hour || 12,
                    isFemale: isFemaleFromGender(params.gender),
                    isSolar: isSolarFromCalendar(params.calendar)
                });
                const ctx = calc.calculate();
                if (params.targetDay) return thoiGianLuan.analyzeLiuRi(ctx, params.targetYear, params.targetMonth, params.targetDay);
                if (params.targetMonth) return thoiGianLuan.analyzeLiuYue(ctx, params.targetYear, params.targetMonth);
                return thoiGianLuan.analyzeLiuNian(ctx, params.targetYear || new Date().getFullYear());
            }
        );
    }

    match(person1, person2, relationship) {
        const hopHon = require('../bazi/hop_hon');
        return hopHon.analyzeCompatibility(person1, person2, relationship || 'romance');
    }

    mapToChart(ctx) {
        if (!ctx) return null;
        const gans = ctx.gans || [];
        const zhis = ctx.zhis || [];
        const naYin = ctx.naYin || [];
        const shenSha = ctx.shenSha || [];
        const ganShens = ctx.ganShens || [];

        function safeGan(g) { return g ? ganzhi.ganToVN(g) : ''; }
        function safeZhi(z) { return z ? ganzhi.zhiToVN(z) : ''; }

        return {
            nam_sinh: ctx.year,
            gioi_tinh: ctx.isFemale ? 'Nữ' : 'Nam',
            tru_nam:   { can: safeGan(gans[0]), chi: safeZhi(zhis[0]), nap_am: naYin[0] || '', than_sat: shenSha[0] || [] },
            tru_thang: { can: safeGan(gans[1]), chi: safeZhi(zhis[1]), nap_am: naYin[1] || '', than_sat: shenSha[1] || [] },
            tru_ngay:  { can: safeGan(gans[2]), chi: safeZhi(zhis[2]), nap_am: naYin[2] || '', than_sat: shenSha[2] || [], chu: safeGan(ctx.dayGan) },
            tru_gio:   { can: safeGan(gans[3]), chi: safeZhi(zhis[3]), nap_am: naYin[3] || '', than_sat: shenSha[3] || [] },
            menh: naYin[0] || '',
            than_vuong_suy: ctx.dayMasterStrength || 'Bình Hòa',
            dung_than: ctx.usefulGods || [],
            ky_than: ctx.harmfulGods || [],
            diem_so: {
                ngu_hanh_vn: ctx.nguHanhResult && ctx.nguHanhResult.scores ? ctx.nguHanhResult.scores : {},
                ngu_hanh: ctx.elements || {}
            },
            dai_van: ctx.dai_van || [],
            pillars: {
                year:  { gan: safeGan(gans[0]), zhi: safeZhi(zhis[0]) },
                month: { gan: safeGan(gans[1]), zhi: safeZhi(zhis[1]) },
                day:   { gan: safeGan(gans[2]), zhi: safeZhi(zhis[2]) },
                hour:  { gan: safeGan(gans[3]), zhi: safeZhi(zhis[3]) }
            },
            elements: ctx.elements || {},
            shishen: {
                year: ganShens[0] || '', month: ganShens[1] || '',
                day: ganShens[2] || '', hour: ganShens[3] || ''
            }
        };
    }
}

module.exports = new BaZiService();
