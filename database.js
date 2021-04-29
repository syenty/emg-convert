const mysql = require('mysql')
const dbInfo = {
    host: '172.18.1.190',
    port: '3306',
    user: 'phrp',
    password: 'phrp1234',
    database: 'phrp'
}

module.exports = {
    init: function () {
        return mysql.createConnection(dbInfo)
    },
    connect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err)
            else console.log('mysql is connected successfully!')
        });
    }
}