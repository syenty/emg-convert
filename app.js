const express = require("express")
const fileUpload = require('express-fileupload')
const FormData = require("form-data")
const cors = require('cors')
const fs = require('fs')
const { v4: uuidv4 } = require('uuid')

const keys = require("./json/keys.json")
const dbProperties = require("./json/database-properties.json")

const dbConfig = require('./database')

let pool

const app = express()

app.use(cors())
app.use(fileUpload())
// app.use(express.urlencoded({ extended: false }))
// app.use(express.json())

const CmdUtil = require('./lib/cmdUtil')
const cmdUtil = new CmdUtil

app.post("/file/receive", (req, res) => {

    console.log(req)

    const body = req.body
    const uuid = uuidv4()

    const { files: { multipartFile: uploadFile } } = req
    const fileName = `${uuid}_${uploadFile.name}`
    // const fileName =uploadFile.name
    const fileSize = uploadFile.size
    const noExtFileName = fileName.replace(/(.shpf|.hpf|.csv)$/, "")
    
    console.log(`\nfileName : ${fileName}`)
    console.log(`noExtFileName : ${noExtFileName}`)
    console.log(`fileSize : ${fileSize}`)

    res.status(200).send("receive finish")

	pool = dbConfig.init()

    const promise1 = new Promise((resolve, reject) => {
        pool.getConnection((err, conn) => {
            // if(err) throw err
			if(err) console.log(err)
            conn.query(dbProperties.insertSql, [body.userId, body.activityDate, "CONNECTED"], async function(err) {
                if(err) {
                    conn.release()
                    reject(Error("1. insert fail | " + err))
                }else{
                    await conn.commit()
                    conn.release()
                    resolve(true)
                }
            })
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
                            pool.getConnection((err, conn) => {
                                // if(err) throw err
								if(err) console.log(err)
                                conn.query(dbProperties.updateSql, ["CONVERTED", body.userId, body.activityDate], async function(err) {
                                    if(err) {
                                        conn.release()
                                        reject(Error("2. update fail | " + err))
                                    }else{
                                        await conn.commit()
                                        conn.release()
                                        resolve(true)
                                    }
                                })
                            })
                        })

                        promise2.then(result2 => {

                            if(result2){

                                let form = new FormData({ maxDataSize: Infinity })
                                form.append("userId",body.userId)
                                form.append("activityDate",body.activityDate)
                                form.append("careCd",body.careCd)
                                form.append("sampling",body.sampling)

                                cmdUtil.sendFile(noExtFileName, form)
                                .then(sendSuccess => {
                                    if(sendSuccess) {

                                        const promise3 = new Promise((resolve, reject) => {
                                            pool.getConnection((err, conn) => {
												// if(err) throw err
												if(err) console.log(err)
                                                conn.query(dbProperties.updateSql, ["SEND_DATA", body.userId, body.activityDate], async function(err) {
                                                    if(err) {
                                                        conn.release()
                                                        reject(Error("3. update fail | " + err))
                                                    }else{
                                                        await conn.commit()
														conn.release()
                                                        resolve(true)
                                                    }
                                                })
                                            })
                                        })
        
                                        promise3
                                        .then(result3 => { 
											if(result3) {
												console.log("send finish")
												// res.status(200).send("send finish")
											}
										})
                                        .catch(err => console.log(err))
                                        // .finally(() => pool.end(err => { if(err) console.log(err) }))

                                    }
                                })

                            }

                        })
                        .catch(err => console.log(err))

                    } else res.status(500).send("hpf error...")
                } else res.status(500).send("shpf error...")
                
            })

        }
    })

})

app.listen(8090, function () {
    console.log('middleware web server listening on port 8090')
})
