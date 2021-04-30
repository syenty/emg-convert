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

        return new Promise((resolve, reject) => {
            cmd.run(cmdArr, {cwd: keys.docPath, shell: true})
            .then(exitCodes => {
                console.log(`delete : ${exitCodes}`)
                resolve(true)
            })
            .catch(err => {
                console.log(`delete | err : ${err}`)
                reject(err)
            })
        })
    }

    getCsvFile(fileName){
        // return fs.readFileSync(`${keys.docPath}\\${fileName}.csv`, "utf-8")
		try{
			return new Blob([fs.readFileSync(`${keys.docPath}\\${fileName}.csv`, "utf-8")])	
		} catch (e){
			console.log(e)
		}
    }

	toArrayBuffer(buf) {
		let ab = new ArrayBuffer(buf.length)
		let view = new Uint8Array(ab)
		for (let i = 0; i < buf.length; ++i) {
			view[i] = buf[i]
		}
		return ab
	}

    sendFile(fileName, form){

        // const config = { headers: { 'Content-Type': 'application/octet-stream', 'x-Content-Type': 'multipart/form-data; boundary='+form._boundary }, maxContentLength: Infinity, maxBodyLength: Infinity }
        const config = { headers: { 'Content-Type': 'multipart/form-data; boundary='+form._boundary }, maxContentLength: Infinity, maxBodyLength: Infinity }
		
		form.append("uploadFile", fs.createReadStream(`${keys.docPath}\\${fileName}.csv`, "utf-8"))

        return new Promise((resolve, reject) => {
            axios.post(`${keys.destination}/file/accept`, form, config)
            .then(res => {
				if(res.status === 200){
					this.deleteDoc(fileName)
					.then(deleteSuccess => {
						if(deleteSuccess) resolve(true)
					})
					.catch(err => reject(err))	
				}
            })
            .catch(err => reject(err))
        })
        
    }

}

module.exports = cmdUtil