const mysql = require('mysql')

// single
// const dbInfo = {
//     host: '172.18.1.190',
//     port: '3306',
//     user: 'phrp',
//     password: 'phrp1234',
//     database: 'phrp'
// }

// pool
const dbInfo = {
    connectionLimit : 30,
    host: '172.18.1.190',
    port: '3306',
    user: 'phrp',
    password: 'phrp1234',
    database: 'phrp'
}

module.exports = {
    init: function () {
        // return mysql.createConnection(dbInfo)
        return mysql.createPool(dbInfo)
    },
    singleConnect: function(conn) {
        conn.connect(function(err) {
            if(err) console.error('mysql connection error : ' + err)
            else console.log('mysql is connected successfully!')
        })
    }
}