const cmd = require("node-run-cmd")
const fs = require('fs')
const axios = require("axios")

const keys = require("../json/keys.json")

class cmdUtil {

    convertShpf(fileName){

        const shpfToHpfCmd = `${keys.delsysPath}\\DelsysFileUtil.exe -nogui -i ${keys.docPath}\\${fileName}.shpf -o HPF`

        return new Promise((resolve, reject) => {
            cmd.run(shpfToHpfCmd, { shell: true })
            .then(exitCodes => {
                console.log(`shpf => hpf : ${exitCodes}`)
                resolve(true)
            })
            .catch(err => {
                console.log(`shpf => hpf | err : ${err}`)
                reject(err)
            })
        })

    }

    convertHpf(fileName){

        const hpfToCsvCmd = `${keys.delsysPath}\\DelsysFileUtil.exe -nogui -i ${keys.docPath}\\${fileName}.hpf -o CSV`

        return new Promise((resolve, reject) => {
            cmd.run(hpfToCsvCmd, { shell: true })
            .then(exitCodes => {
                console.log(`hpf => csv : ${exitCodes}`)
                resolve(true)
            })
            .catch(err => {
                console.log(`hpf => csv | err : ${err}`)
                reject(err)
            })
        })

    }

    deleteDoc(fileName){

        let cmdArr = ["shpf","hpf","csv"].reduce((acc, ext) => {
            acc.push(`del .\\${fileName}.${ext}`)
            return acc
        },[])

        cmd.run(cmdArr, {cwd: keys.docPath, shell: true})
        .then(exitCodes => {
            console.log(`delete : ${exitCodes}`)
        })
        .catch(err => {
            console.log(`delete | err : ${err}`)
            reject(err)
        })

    }

    sendFile(fileName){

        const config = { headers: { 'Content-Type': 'application/octet-stream' }, maxContentLength: Infinity, maxBodyLength: Infinity }
        const params = { csvFile: fs.readFileSync(`${keys.docPath}\\${fileName}.csv`, "utf-8") }

        // console.log(params)

        axios.defaults.headers.post = null
        axios.post(`${keys.destination}/file/excel`, params, config)
        .then(res => {
            console.log(res)
        })
        .catch(err => {
            console.log(err)
        })

    }

}

module.exports = cmdUtil