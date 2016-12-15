var cassandra = require('cassandra-driver');

module.exports = new cassandra.Client({contactPoints: ['172.22.28.165', '172.22.28.164', '172.22.28.163', '172.22.28.162' ], keyspace: 'broadband'});
