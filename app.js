const express = require("express")
const fileUpload = require('express-fileupload')
const FormData = require("form-data")
const cors = require('cors')
const fs = require('fs')
const axios = require("axios")

const keys = require("./json/keys.json")
const dbProperties = require("./json/database-properties.json")

const dbConfig = require('./database')
const conn = dbConfig.init()
dbConfig.connect(conn)

const app = express()

app.use(cors())
app.use(fileUpload())

const CmdUtil = require('./lib/cmdUtil')
const cmdUtil = new CmdUtil

app.post("/file/receive", async (req, res) => {

	// const { files: { file } } = req
    
    // const { files: { file: uploadFile } } = req

    // console.log(req)

    const body = req.body

    const { files: { multipartFile: uploadFile } } = req
    const fileName = uploadFile.name
    const fileSize = uploadFile.size
    const noExtFileName = fileName.replace(/(.shpf|.hpf|.csv)$/, "")
    
    console.log(`fileName : ${fileName}`)
    console.log(`noExtFileName : ${noExtFileName}`)
    console.log(`fileSize : ${fileSize}`)

    // res.status(200).send("receive finish")

    const promise1 = new Promise((resolve, reject) => {
        conn.query(dbProperties.insertSql, [body.userId, body.activityDate, "CONNECTED"], function(err) {
            if(err) {
                conn.destroy()
                reject(Error("1. insert fail"))
            }else{
                resolve(true)
            }
        })
    })
    
    promise1.then(result1 => {
        if(result1) {

            uploadFile.mv( `${keys.docPath}/${fileName}`, async function (err) {
    
                if(err) {
                    console.log("error")
                    res.status(500).send(err)
                }
            
                if(await cmdUtil.convertShpf(noExtFileName)){
                    if(await cmdUtil.convertHpf(noExtFileName)){

                        const promise2 = new Promise((resolve, reject) => {
                            conn.query(dbProperties.upadte, ["CONVERTED", body.userId, body.activityDate], function(err) {
                                if(err) {
                                    conn.destroy()
                                    reject(Error("2. update fail"))
                                }else{
                                    resolve(true)
                                }
                            })
                        })

                        promise2.then(result2 => {

                            if(result2){

                                let form = new FormData({ maxDataSize: Infinity })
                                form.append("userId",body.userId)
                                form.append("careCd",body.careCd)
                                form.append("activityDate",body.activityDate)
                                form.append("sampling",body.sampling)
                                
                                cmdUtil.sendFile(noExtFileName, form)
                                .then(sendSuccess => {
                                    if(sendSuccess) {

                                        const promise3 = new Promise((resolve, reject) => {
                                            conn.query(dbProperties.upadte, ["SEND_DATA", body.userId, body.activityDate], function(err) {
                                                if(err) {
                                                    conn.destroy()
                                                    reject(Error("3. update fail"))
                                                }else{
                                                    resolve(true)
                                                }
                                            })
                                        })

                                        promise3
                                        .then(result3 => {
                                            if(result3) console.log("send finish")
                                        })
                                        .catch(err => console.log(err))
                                        .finally(() => conn.destroy())

                                    }
                                })

                                // const promise = new Promise((resolve) => {
        
                                // 	let form = new FormData({ maxDataSize: Infinity })
                                // 	form.append("userId",body.userId)
                                // 	form.append("careCd",body.careCd)
                                // 	form.append("activityDate",body.activityDate)
                                // 	form.append("sampling",body.sampling)
                                    
                                //     // form.append("uploadFile", fs.createReadStream(uploadFile.data))
                                // 	form.append("uploadFile", fs.createReadStream(`${keys.docPath}\\${noExtFileName}.csv`))
                                //     form.pipe(concat({ encoding: 'buffer' }, data => resolve({ data, headers: form.getHeaders() })))
                                //   })
                                //   promise.then(({ data, headers }) => axios.post(`${keys.destination}/fatigMonitor/file/accept`, data, { headers })
                                // 		.then(res => {
                                // 			if(res.status === 200) cmdUtil.deleteDoc(noExtFileName)
                                // 		})
                                // 		)
                                // 		.catch(err => console.log(err))
                                    
                
                                // res.setHeader('x-Content-Type', 'multipart/form-data; boundary='+form._boundary)
                                // res.setHeader('Content-Type', 'text/plain')
                                // form.pipe(res)

                            }

                        })
                        .catch(err => console.log(err))

                    } else res.status(500).send("hpf error...")
                } else res.status(500).send("shpf error...")
                
            })

        }
    })

})

app.listen(9090, function () {
    console.log('middleware web server listening on port 9090')
})