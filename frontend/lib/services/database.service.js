/**
 * Supabase Database Service
 * Replaces SQLite database.service.js — same method signatures
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');

function getSupabase() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment');
    return createClient(url, key);
}

class DatabaseService {

    // ── Customers ──────────────────────────────────────────────────────────────

    async findOrCreateCustomer(userData) {
        const { name, year, month, day, hour, minute, gender, calendar } = userData;
        const sb = getSupabase();
        const h = (hour !== undefined && hour !== null) ? hour : 12;
        const m = (minute !== undefined && minute !== null) ? minute : 0;

        const { data: existing } = await sb
            .from('customers')
            .select('id')
            .eq('year', year).eq('month', month).eq('day', day)
            .eq('hour', h).eq('minute', m)
            .limit(1)
            .maybeSingle();

        if (existing) {
            if (name) {
                await sb.from('customers')
                    .update({ name: name, updated_at: new Date().toISOString() })
                    .eq('id', existing.id);
            }
            return existing.id;
        }

        const { data, error } = await sb.from('customers').insert({
            name: name || 'Mệnh chủ',
            year: year, month: month, day: day,
            hour: h, minute: m,
            gender: gender || 'Nam',
            calendar: calendar || 'solar'
        }).select('id').single();

        if (error) throw error;
        return data.id;
    }

    async createNewCustomer(userData) {
        const { name, year, month, day, hour, minute, gender, calendar } = userData;
        const sb = getSupabase();
        const { data, error } = await sb.from('customers').insert({
            name: name || 'Mệnh chủ',
            year: year, month: month, day: day,
            hour: (hour !== undefined && hour !== null) ? hour : 12,
            minute: (minute !== undefined && minute !== null) ? minute : 0,
            gender: gender || 'Nam',
            calendar: calendar || 'solar'
        }).select('id').single();
        if (error) throw error;
        return data.id;
    }

    async getCustomer(customerId) {
        const sb = getSupabase();
        const { data } = await sb.from('customers').select('*').eq('id', customerId).maybeSingle();
        return data;
    }

    async getAllCustomers(limit) {
        limit = limit || 100;
        const sb = getSupabase();
        const { data } = await sb.from('customers')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(limit);
        return data || [];
    }

    async getRecentCustomersWithQuestions(limit) {
        limit = limit || 10;
        const sb = getSupabase();
        const { data } = await sb.from('consultations')
            .select('customer_id, question_text, created_at, customers(id, name, year, month, day, hour, minute, gender)')
            .order('created_at', { ascending: false })
            .limit(limit * 3);

        if (!data) return [];
        const seen = new Set();
        const result = [];
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            if (!row.customers || seen.has(row.customer_id)) continue;
            seen.add(row.customer_id);
            result.push(Object.assign({}, row.customers, {
                last_question: row.question_text,
                consultation_time: row.created_at,
                last_activity: row.created_at
            }));
            if (result.length >= limit) break;
        }
        return result;
    }

    async getCustomersWithPagination(page, limit, search) {
        page = page || 1;
        limit = limit || 20;
        search = search || '';
        const sb = getSupabase();
        const offset = (page - 1) * limit;
        let query = sb.from('customers').select('*', { count: 'exact' });
        if (search) query = query.ilike('name', '%' + search + '%');
        const { data, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        return { customers: data || [], total: count || 0, page: page, limit: limit };
    }

    async getCustomerWithConsultations(customerId) {
        const customer = await this.getCustomer(customerId);
        if (!customer) return null;
        const history = await this.getCustomerHistory(customerId);
        return Object.assign({}, customer, { consultations: history });
    }

    // ── Consultations ──────────────────────────────────────────────────────────

    async saveConsultation(customerId, themeId, questionId, questionText, answer, useAI, creditsUsed, userId, persona, followUps, extraData) {
        useAI = useAI !== undefined ? useAI : true;
        creditsUsed = creditsUsed || 0;
        userId = userId || null;
        persona = persona || 'huyen_co';
        followUps = followUps || [];
        extraData = extraData || {};

        const sb = getSupabase();
        const answerJson = (typeof answer === 'object' && answer !== null) ? JSON.stringify(answer) : (answer || '');

        const { data, error } = await sb.from('consultations').insert({
            customer_id: customerId,
            theme_id: themeId || '',
            question_id: questionId,
            question_text: questionText || '',
            answer: answerJson,
            use_ai: useAI,
            credits_used: creditsUsed,
            user_id: userId,
            persona: persona,
            follow_ups: JSON.stringify(followUps),
            person1_data: extraData.person1 ? JSON.stringify(extraData.person1) : null,
            person2_data: extraData.person2 ? JSON.stringify(extraData.person2) : null,
            metadata: extraData.metadata ? JSON.stringify(extraData.metadata) : null
        }).select('id').single();

        if (error) throw error;
        return data.id;
    }

    async getUserHistory(userId, limit) {
        limit = limit || 20;
        const sb = getSupabase();
        const { data } = await sb.from('consultations')
            .select('id, question_id, question_text, answer, use_ai, credits_used, created_at, persona, follow_ups, person1_data, person2_data, metadata')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return (data || []).map(function(row) {
            try { row.answer = JSON.parse(row.answer || '[]'); } catch(e) {}
            try { row.follow_ups = JSON.parse(row.follow_ups || '[]'); } catch(e) {}
            try { row.person1_data = JSON.parse(row.person1_data || 'null'); } catch(e) {}
            try { row.person2_data = JSON.parse(row.person2_data || 'null'); } catch(e) {}
            try { row.metadata = JSON.parse(row.metadata || 'null'); } catch(e) {}
            return row;
        });
    }

    async getCustomerHistory(customerId, limit) {
        limit = limit || 50;
        const sb = getSupabase();
        const { data } = await sb.from('consultations')
            .select('id, question_id, question_text, answer, use_ai, created_at, persona, follow_ups')
            .eq('customer_id', customerId)
            .order('created_at', { ascending: false })
            .limit(limit);

        return (data || []).map(function(row) {
            try { row.answer = JSON.parse(row.answer || '[]'); } catch(e) { row.answer = []; }
            return row;
        });
    }

    // ── Categories & Questions ─────────────────────────────────────────────────

    async getAllCategories() {
        const sb = getSupabase();
        const { data } = await sb.from('question_categories')
            .select('*')
            .order('order_index', { ascending: true });
        return data || [];
    }

    async createCategory(categoryData) {
        const sb = getSupabase();
        const { data, error } = await sb.from('question_categories').insert({
            name: categoryData.name,
            icon: categoryData.icon || '📋',
            order_index: categoryData.order_index || 0
        }).select('id').single();
        if (error) throw error;
        return data.id;
    }

    async updateCategory(id, categoryData) {
        const sb = getSupabase();
        await sb.from('question_categories').update({
            name: categoryData.name,
            icon: categoryData.icon || '📋',
            order_index: categoryData.order_index || 0,
            is_active: !!categoryData.is_active
        }).eq('id', id);
    }

    async deleteCategory(id) {
        const sb = getSupabase();
        await sb.from('custom_questions').delete().eq('category_id', id);
        await sb.from('question_categories').delete().eq('id', id);
    }

    async getAllQuestions(categoryId) {
        const sb = getSupabase();
        let query = sb.from('custom_questions')
            .select('*, question_categories(name)')
            .order('order_index', { ascending: true });
        if (categoryId) query = query.eq('category_id', categoryId);
        const { data } = await query;
        return (data || []).map(function(q) {
            return Object.assign({}, q, { category_name: q.question_categories && q.question_categories.name });
        });
    }

    async createQuestion(questionData) {
        const sb = getSupabase();
        const { data, error } = await sb.from('custom_questions').insert({
            category_id: questionData.category_id,
            text: questionData.text,
            order_index: questionData.order_index || 0
        }).select('id').single();
        if (error) throw error;
        return data.id;
    }

    async updateQuestion(id, questionData) {
        const sb = getSupabase();
        await sb.from('custom_questions').update({
            category_id: questionData.category_id,
            text: questionData.text,
            order_index: questionData.order_index || 0,
            is_active: !!questionData.is_active
        }).eq('id', id);
    }

    async deleteQuestion(id) {
        const sb = getSupabase();
        await sb.from('custom_questions').delete().eq('id', id);
    }

    // ── Stats ──────────────────────────────────────────────────────────────────

    async getStats() {
        const sb = getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const [r1, r2, r3, r4] = await Promise.all([
            sb.from('customers').select('*', { count: 'exact', head: true }),
            sb.from('consultations').select('*', { count: 'exact', head: true }),
            sb.from('consultations').select('*', { count: 'exact', head: true }).eq('use_ai', true),
            sb.from('consultations').select('*', { count: 'exact', head: true }).gte('created_at', today)
        ]);
        return {
            totalCustomers: r1.count || 0,
            totalConsultations: r2.count || 0,
            aiConsultations: r3.count || 0,
            todayConsultations: r4.count || 0
        };
    }

    async getDailyConsultationStats() {
        const sb = getSupabase();
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().slice(0, 10));
        }
        return Promise.all(days.map(async function(date) {
            const { count } = await sb.from('consultations')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', date)
                .lt('created_at', date + 'T23:59:59');
            return { date: date, count: count || 0 };
        }));
    }

    async getConsultationByCategoryStats() {
        const sb = getSupabase();
        const { data } = await sb.from('question_categories').select('id, name, icon');
        if (!data) return [];
        return Promise.all(data.map(async function(cat) {
            const { count } = await sb.from('consultations')
                .select('*', { count: 'exact', head: true })
                .eq('theme_id', String(cat.id));
            return { label: cat.name, icon: cat.icon, value: count || 0 };
        }));
    }

    // ── Que (Xin Quẻ) ─────────────────────────────────────────────────────────

    async getQue(user_id, customer_id, context_id, que_type, period_key) {
        const sb = getSupabase();
        let query = sb.from('consultations')
            .select('*')
            .eq('theme_id', 'xin_que')
            .ilike('metadata', '%"contextId":"' + context_id + '"%')
            .ilike('metadata', '%"queType":"' + que_type + '"%')
            .ilike('metadata', '%"periodKey":"' + period_key + '"%');

        if (user_id) query = query.eq('user_id', user_id);
        const { data } = await query.limit(1).maybeSingle();
        if (!data) return null;

        try {
            const meta = JSON.parse(data.metadata || '{}');
            const guaData = meta.gua_data || {};
            if (!guaData.ai_analysis && data.answer) {
                try {
                    const answers = JSON.parse(data.answer);
                    guaData.ai_analysis = Array.isArray(answers) ? answers.join('\n\n') : data.answer;
                } catch(e) {
                    guaData.ai_analysis = data.answer;
                }
            }
            return { gua_data: guaData, user_note: meta.user_note || '', is_verified: meta.is_verified || false };
        } catch(e) {
            return null;
        }
    }

    async getQueHistory(userId, page, limit) {
        page = page || 1;
        limit = limit || 10;
        const sb = getSupabase();
        const offset = (page - 1) * limit;

        const { count } = await sb.from('consultations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('theme_id', 'xin_que');

        const { data } = await sb.from('consultations')
            .select('*')
            .eq('user_id', userId)
            .eq('theme_id', 'xin_que')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        const items = (data || []).map(function(r) {
            let meta = {};
            try { meta = JSON.parse(r.metadata || '{}'); } catch(e) {}
            return {
                id: r.id,
                que_type: meta.queType || r.question_id,
                period_key: meta.periodKey,
                gua_name: meta.guaName,
                gua_number: meta.guaNumber,
                gua_data: meta.gua_data || {},
                created_at: r.created_at,
                is_verified: meta.is_verified || false,
                user_note: meta.user_note || ''
            };
        });

        return {
            items: items,
            meta: {
                total: count || 0,
                page: page,
                limit: limit,
                totalPages: Math.ceil((count || 0) / limit)
            }
        };
    }

    async updateQueNote(id, note, isVerified) {
        const sb = getSupabase();
        const { data } = await sb.from('consultations').select('metadata').eq('id', id).maybeSingle();
        if (!data) return;
        try {
            const meta = JSON.parse(data.metadata || '{}');
            meta.user_note = note;
            meta.is_verified = isVerified;
            await sb.from('consultations').update({ metadata: JSON.stringify(meta) }).eq('id', id);
        } catch(e) {
            console.error('[DB] updateQueNote error:', e.message);
        }
    }

    async getQueTimeline(userId, type, limit) {
        limit = limit || 7;
        const sb = getSupabase();
        const { data } = await sb.from('consultations')
            .select('id, answer, metadata, created_at')
            .eq('user_id', userId)
            .eq('theme_id', 'xin_que')
            .ilike('metadata', '%"queType":"' + type + '"%')
            .order('created_at', { ascending: false })
            .limit(limit);
        return data || [];
    }

    // ── Access Logs ────────────────────────────────────────────────────────────

    saveAccessLog(logData) {
        const { ip, method, path, statusCode, userAgent, userId, userEmail, responseTime } = logData;
        const sb = getSupabase();
        sb.from('access_logs').insert({
            ip: ip,
            method: method,
            path: path,
            status_code: statusCode,
            user_agent: userAgent || '',
            user_id: userId || null,
            user_email: userEmail || null,
            response_time: responseTime || 0
        }).then(function(result) {
            if (result.error) console.error('[DB] saveAccessLog error:', result.error.message);
        });
    }

    async getAccessLogs(page, limit, filters) {
        page = page || 1;
        limit = limit || 50;
        filters = filters || {};
        const sb = getSupabase();
        const offset = (page - 1) * limit;
        let query = sb.from('access_logs').select('*', { count: 'exact' });
        if (filters.ip) query = query.ilike('ip', '%' + filters.ip + '%');
        if (filters.path) query = query.ilike('path', '%' + filters.path + '%');
        if (filters.method) query = query.eq('method', filters.method);
        if (filters.date) query = query.gte('created_at', filters.date).lt('created_at', filters.date + 'T23:59:59');
        const { data, count } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
        return {
            items: data || [],
            meta: { total: count || 0, page: page, limit: limit, totalPages: Math.ceil((count || 0) / limit) }
        };
    }

    async getAccessStats() {
        const sb = getSupabase();
        const today = new Date().toISOString().slice(0, 10);
        const { count } = await sb.from('access_logs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today);
        return { today: { totalRequests: count || 0 } };
    }

    // ── Compat shims ───────────────────────────────────────────────────────────

    // que.service.js calls database.get('SELECT credits FROM users ...') for credit check
    async get(sql) {
        if (sql && sql.indexOf('credits FROM users') !== -1) {
            return { credits: 9999 };
        }
        return null;
    }

    // No-auth mode: credits unlimited, deduction is a no-op
    async deductCredits() {
        return true;
    }
}

module.exports = new DatabaseService();
