// この JavaScript は Amazon Lambda では実行しません。
// Amazon Lambda で実行するコードは index.mjs になります。
// これは index.mjs で検索するために、検索用の JSON ファイルを使うのですが、この JSON ファイルを作る関数です。
// GitHub Actions 等でデプロイする前にこの関数を呼び出して、search.json を作成します。

// テスト用
// node .\search-json-generator.mjs 'C:\Users\takusan23\Desktop\Dev\NextJS\ziyuutyou-next\content\posts' '/posts'

// @ts-check
import fs from 'fs/promises'
import matter from 'gray-matter'
import path from 'path'

const main = async () => {
    // コマンドライン引数で
    // Markdown 一覧が入ってるフォルダパスを受け取る
    const folderPath = process.argv[2]
    // ベース URL。 /posts みたいな
    const baseUrl = process.argv[3]

    // ファイル名が取れるので、完全パスにする
    const filePathList = (await fs.readdir(folderPath))
        .map(fileName => path.join(folderPath, fileName))

    // ファイルを読み出してパースする
    // async await は map の中だと使えない
    // Promise を map で返して Promise.all で全部待つ
    const markdownDataList = await Promise.all(filePathList.map(async filePath => ({
        filePath: filePath,
        result: matter(await fs.readFile(filePath, 'utf-8'))
    })))

    // パースした内容から検索用の JSON オブジェクトを作る
    const searchJsonObject = markdownDataList.map(({ filePath, result }) => {
        const title = result.data['title']
        const date = result.data['created_at']
        const createdAt = date.toLocaleDateString('ja-JP')
        const fileName = path.parse(filePath).name
        const content = result.content

        return {
            title: title,
            link: `${baseUrl}/${fileName}`,
            createdAt: createdAt,
            markdown: content
        }
    })

    // ファイルに出す
    await fs.writeFile('search.json', JSON.stringify(searchJsonObject))
}

await main()