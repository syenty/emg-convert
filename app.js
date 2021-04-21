const express = require("express")
const fileUpload = require('express-fileupload')
const cors = require('cors')

const keys = require("./json/keys.json")

const app = express()

app.use(cors())
app.use(fileUpload())

const CmdUtil = require('./lib/cmdUtil')
const cmdUtil = new CmdUtil

app.post("/file/receive", (req, res) => {

    const { files: { file } } = req

    const { files: { file: uploadFile } } = req
    const fileName = uploadFile.name
    const fileSize = uploadFile.size
    const noExtFileName = fileName.replace(/(.shpf|.hpf|.csv)$/, "")

    console.log(`fileName : ${fileName}`)
    console.log(`noExtFileName : ${noExtFileName}`)
    console.log(`fileSize : ${fileSize}`)
 
    uploadFile.mv( `${keys.docPath}/${fileName}`, async function (err) {

        if(err) {
            console.log("error")
            return res.status(500).send(err)
        }

        if(await cmdUtil.convertShpf(noExtFileName)){
            if(await cmdUtil.convertHpf(noExtFileName)){
                res.status(200).send("convert finish!")
                cmdUtil.sendFile(noExtFileName)
                // cmdUtil.deleteDoc(noExtFileName)
            } else res.status(500).send("hpf error...")
        } else res.status(500).send("shpf error...")
        
    })

})

app.post("/file/excel", (req, res) => {

    console.log("excel comes")
    console.log(req.params)
    // res.status(200).send("get excel")

})

app.listen(9090, function () {
    console.log('middleware web server listening on port 9090')
})