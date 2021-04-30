const mysql = require('mysql')

// single
// const dbInfo = {
//     host: '',
//     port: '',
//     user: '',
//     password: '',
//     database: ''
// }

// pool
const dbInfo = {
    connectionLimit : 30,
    host: '',
    port: '',
    user: '',
    password: '',
    database: ''
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