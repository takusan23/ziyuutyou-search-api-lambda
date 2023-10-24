import fs from 'fs/promises'

const handler = async (event, context) => {
    // クエリパラメータ query を取り出す
    const { query } = event.queryStringParameters
    // なければエラー
    if (!query) {
        return {
            statusCode: 400
        }
    }

    // 読み込んで JSON にする
    const searchJsonFile = await fs.readFile('search.json', 'utf-8')
    const searchJsonObject = JSON.parse(searchJsonFile)

    // 部分一致検索をする
    // 10 件まで
    const findBlogItem = searchJsonObject
        .filter(blogItem => blogItem['title'].includes(query) || blogItem['markdown'].includes(query))
        .slice(0, 10)

    const response = {
        statusCode: 200,
        body: JSON.stringify(findBlogItem)
    }
    return response
}

// テスト
// console.log(await handler({ queryStringParameters: { query: 'D.C.4' } }, undefined))

export default handler