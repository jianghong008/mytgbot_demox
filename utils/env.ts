import path from 'path'
import file from 'fs/promises'
export async function loadEnv():Promise<any>{
    const envPath = path.join(process.cwd() , '.env.local')
    await file.access(envPath)
    const res = await file.readFile(envPath,{encoding:'utf-8'})
    const lines = res.split('\n')
    const envs = {}
    for (const line of lines) {
        const [key,value] = line.split('=')
        Reflect.set(envs,key,value)
    }
    process.env = {...process.env,...envs}
    return envs
}