const fs = require('fs')
const path = require('path')
const fetch = require('node-fetch')
const library = ['./library', '../library/6.01'].find(item => fs.existsSync(item))

const worldFile = path.join(library, 'World.csv')
const worldMap = fs.readFileSync(worldFile, 'utf-8').split('\n')
  .map(line => line.trim().split(','))
  .reduce((obj, [id, name]) => {
    if (!id || !name) return obj
    return {
      ...obj,
      [name.replace(/"/g, '')]: +id
    }
  }, {})

console.log(worldMap)
const areaMap = {
  '陆行鸟': 'LuXingNiao',
  '莫古力': 'MoGuLi',
  '猫小胖': 'MaoXiaoPang',
  '豆豆柴': 'DouDouChai'
}

fetch('https://ff14act.web.sdo.com/api/groupAndRole/getAreaAndGroupList').then(async res => {
  const json = await res.json()

  if (json.code !== 10000) {
    throw new Error('SDO api returns unexpected code')
  }

  if (json.data.length !== 4) {
    throw new Error('DC incorrect or changed')
  }

  try {
    fs.mkdirSync('./dist/')
  } catch (e) {}
  fs.writeFileSync('./dist/server.json', JSON.stringify(json.data.map(({ AreaID, AreaName, vGroup }) => {
    return {
      dc: AreaID,
      name_chs: AreaName,
      name_en: areaMap[AreaName],
      worlds: vGroup.map(({ GroupID, GroupName, UniName }) => {
        return {
          id: worldMap[UniName],
          sdo_id: GroupID,
          name_chs: GroupName,
          name_en: UniName
        }
      })
    }
  }), null, 2))
})