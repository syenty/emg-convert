const express = require("express")
const fileUpload = require('express-fileupload')
const FormData = require("form-data")
const cors = require('cors')
const fs = require('fs')
const concat = require('concat-stream')
const axios = require("axios")

const keys = require("./json/keys.json")

const app = express()

app.use(cors())
app.use(fileUpload())

const CmdUtil = require('./lib/cmdUtil')
const cmdUtil = new CmdUtil

app.post("/file/receive", (req, res) => {

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

    res.status(200).send("receive finish")

    uploadFile.mv( `${keys.docPath}/${fileName}`, async function (err) {
    
        if(err) {
            console.log("error")
            return res.status(500).send(err)
        }
    
        if(await cmdUtil.convertShpf(noExtFileName)){
            if(await cmdUtil.convertHpf(noExtFileName)){

                // res.status(200).send("convert finish!")
				// res.status(200).sendFile(`${keys.docPath}\\${noExtFileName}.csv`)
				// cmdUtil.deleteDoc(noExtFileName)
				


                // cmdUtil.sendFile(noExtFileName, form)

                const promise = new Promise((resolve) => {

					let form = new FormData({ maxDataSize: Infinity })
					// form.append("uploadFile", cmdUtil.getCsvFile(noExtFileName))
					// form.append("uploadFile", uploadFile.data)
					form.append("userId",body.userId)
					form.append("careCd",body.careCd)
					form.append("activityDate",body.activityDate)
					form.append("sampling",body.sampling)
                    
                    // form.append("uploadFile", fs.createReadStream(uploadFile.data))
					form.append("uploadFile", fs.createReadStream(`${keys.docPath}\\${noExtFileName}.csv`))
                    form.pipe(concat({ encoding: 'buffer' }, data => resolve({ data, headers: form.getHeaders() })))
                  })
                  promise.then(({ data, headers }) => axios.post(`${keys.destination}/fatigMonitor/file/accept`, data, { headers })
						.then(res => {
							if(res.status === 200) cmdUtil.deleteDoc(noExtFileName)
						})
						)
						.catch(err => console.log(err))
					

				// res.setHeader('x-Content-Type', 'multipart/form-data; boundary='+form._boundary)
				// res.setHeader('Content-Type', 'text/plain')
				// form.pipe(res)
				
            } else res.status(500).send("hpf error...")
        } else res.status(500).send("shpf error...")
        
    })


})

app.listen(9090, function () {
    console.log('middleware web server listening on port 9090')
})