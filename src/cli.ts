import * as program from 'commander'
import { readFile } from 'fs'
import { join } from 'path'
import { promisify } from 'util'
import * as jVars from './'

const pReadJsonFile = async (path: string): Promise<any> => {
  return JSON.parse(await promisify(readFile)(path, 'utf8'))
}

(async () => {
  const { version } = await pReadJsonFile(join(__dirname, '../../', './package.json'))

  program
    .version(version)
    .description('Enables the use of variables in JSON and JSON-like configuration files')
    .usage('[options] <config file ...>')
    .arguments('<config>')
    .action(async config => {
      try {
        process.stdout.write(JSON.stringify(await jVars.resolve(await pReadJsonFile(config))) + '\n')
      } catch (error) {
        process.stderr.write(error.message + '\n')
      }
    })
    .parse(process.argv)

  if (process.argv.slice(2).length === 0) {
    return program.outputHelp()
  }
})()
