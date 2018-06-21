const ping = require('net-ping');
const getPingStatusModel = require('../../../db/models/pingStatus');
const update = (host, status) => getPingStatusModel().create(request.payload);

module.exports = (sequelize, host) => {
  setInterval(() => {
    Promise.resolve(ping.createSession())
      .then((session) => new Promise((resolve, reject) => (
        session.pingHost(host, (err, res, sent, rcvd) => (err && reject(err)) || resolve(rcvd - sent))
      )))
      .then((res) => update(host, res.ms))
      .catch((res) => update(host, 0));
  }, 10000);
};
