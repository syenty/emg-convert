const cmd = require("node-run-cmd")
const fs = require('fs')
const axios = require("axios")
const FormData = require("form-data")

const { v4: uuidv4 } = require('uuid')

/*
let form = new FormData({ maxDataSize: Infinity })

form.append("uploadFile", fs.createReadStream("C:\\upload\\004be210420c3.csv"))
form.append("userId","dkitestuser")
form.append("activityDate","2021/04/30 12:34:56")
form.append("careCd","02")
form.append("sampling","1000")

const config = { headers: { 'Content-Type': 'multipart/form-data; boundary='+form._boundary }, maxContentLength: Infinity, maxBodyLength: Infinity }
// const config = { headers: { 'Content-Type': 'application/octet-stream', 'x-Content-Type': 'multipart/form-data; boundary='+form._boundary }, maxContentLength: Infinity, maxBodyLength: Infinity }
// const params = { uploadFile: new Blob([fs.readFileSync("C:\\upload\\004be210420c3.csv", "utf-8")]), ...form }

axios.post(`http://localhost:8080/smart-care-app-api/fatigMonitor/file/accept`, form, config)
.then(res => console.log(res))
.catch(err => console.log(err))
*/


console.log(typeof uuidv4())

