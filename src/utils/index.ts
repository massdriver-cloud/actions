import * as os from 'os'
import fetchAssetFile from './fetch-asset'
import {Asset, getRelease} from './get-release'

const determineArch = (): string => {
  const arch: string = os.arch()
  const mappings: {[key: string]: string} = {
    x64: 'amd64'
  }
  return mappings[arch] || arch
}

const determineFile = (tag: string): string => {
  // we publish darwin and linux binaries
  const osPlatform = os.platform()
  // we publish arm64 and amd64 binaries
  const osArch = determineArch()
  return `mass-${tag}-${osPlatform}-${osArch}.tar.gz`
}

const filterByFileName = (file: string) => (asset: Asset) => file === asset.name

export {
  determineArch,
  determineFile,
  filterByFileName,
  fetchAssetFile,
  getRelease
}
