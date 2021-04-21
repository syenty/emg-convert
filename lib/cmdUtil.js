const cmd = require("node-run-cmd")
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

}

module.exports = cmdUtil