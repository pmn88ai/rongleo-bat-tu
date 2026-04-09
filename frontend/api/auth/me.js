'use strict';

const { withHandler } = require('../_helpers');

module.exports = withHandler(async function(req, res) {
    return res.status(200).json({
        user: {
            id:       'local-user',
            name:     'Mệnh chủ',
            credits:  9999,
            is_admin: false
        }
    });
});
