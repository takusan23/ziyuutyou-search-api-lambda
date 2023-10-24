// @ts-check

import fs from 'fs/promises'
import Fuse from 'fuse.js'

const searchHandler = async (event, context) => {
    // クエリパラメータ query を取り出す
    const query = event?.queryStringParameters?.['query']
    // なければ空を返す
    if (!query) {
        return {
            statusCode: 200,
            body: []
        }
    }

    // 読み込んで JSON にする
    // TODO 時系列じゃない
    const searchJsonFile = await fs.readFile('search.json', 'utf-8')
    const searchJsonObject = JSON.parse(searchJsonFile)

    // Fuse.js で検索をする
    const fuse = new Fuse(searchJsonObject, {
        keys: ['title', 'markdown']
    })
    // 検索
    // 10 件まで
    const searchResult = fuse.search(query)
    // レスポンス用に小さくする
    const responseResult = searchResult
        .map(({ item }) => ({
            title: item['title'],
            link: item['link'],
            description: item['markdown'].slice(0, 100)
        }))
        .slice(0, 10)

    const response = {
        statusCode: 200,
        body: responseResult
    }
    return response
}

// テスト
// const demoResult = await searchHandler({ queryStringParameters: { query: 'android' } }, undefined)
// console.log(demoResult)
// await fs.writeFile('result.json', JSON.stringify(demoResult))

export const handler = searchHandler 