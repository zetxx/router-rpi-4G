const Joi = require('joi');
const getDataUsageModel = require('../../../db/models/dataUsage');
const dataTypeList = ['b', 'kb', 'mb', 'gb', 'tb'];

const convertToBytes = (content) => {
    var arr = content.toLowerCase().split(',').join('').split(' ') || [];
    var dataUsedRaw = arr.shift();
    var dataType = dataTypeList.indexOf(arr.pop());
    var dataUsed = 0;
    if (dataType >= 0) {
        dataUsed = ((!isNaN(parseFloat(dataUsedRaw)) && parseFloat(dataUsedRaw)) || 0) * Math.pow(1024, dataType);
    }
    return dataUsed;
};

module.exports = (server, sequelize) => (server.route({
    method: 'PUT',
    path: '/data/usage',
    config: {
        description: 'data usage',
        notes: 'data usage',
        tags: ['api'],
        handler: ({payload: {raw}}, h) => {
            return getDataUsageModel()
                .create({usedTotal: convertToBytes(raw)})
                .then(() => 'ok');
        },
        validate: {
            payload: Joi.object({
                raw: Joi.string().min(2).required().example('1,817.54 MB')
            }),
            failAction: (request, h, err) => ((err.isJoi && h.response(JSON.stringify(err && err.details)).code(400).takeover()) || h.response(err).takeover())
        }
    }
}));
