const mysql = require('mysql2/promise');
require('dotenv').config();

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const updates = [
    {
      name: 'Pho Thin Lo Duc',
      newName: 'フォー・ティン・ローロック',
      newCuisine: 'ベトナム料理',
      newDescription: '濃厚な牛骨スープが自慢の伝統的なフォー店。ハノイで人気の老舗。シンプルな空間ながら常に賑わっている。',
      newAddress: 'ローロック通り13番地、ハイバーチュン区、ハノイ'
    },
    {
      name: 'Bun Cha Huong Lien',
      newName: 'ブンチャー・フオンリエン',
      newCuisine: 'ベトナム料理',
      newDescription: '濃厚な魚醤と揚げ春巻きが人気の有名ブンチャー店。オバマ元大統領が訪れたことで世界的に有名に。',
      newAddress: 'レーヴァンフー通り24番地、ハイバーチュン区、ハノイ'
    },
    {
      name: "Pizza 4P's Trang Tien",
      newName: 'ピザフォーピーズ・チャンティエン店',
      newCuisine: 'イタリアン',
      newDescription: '天然酵母の手作りピザと自家製チーズが人気。モダンな空間でデートや家族での食事に最適。',
      newAddress: 'チャンティエン通り43番地、ホアンキエム区、ハノイ'
    },
    {
      name: 'Lau Nam Gia Khanh',
      newName: 'きのこ鍋ザーカイン',
      newCuisine: '鍋料理',
      newDescription: '甘みのあるきのこスープと新鮮なきのこが楽しめる鍋専門店。グループに最適で個室完備。',
      newAddress: 'フエ通り152番地、ハイバーチュン区、ハノイ'
    },
    {
      name: 'Egg Coffee Giang',
      newName: 'エッグコーヒー・ザン',
      newCuisine: 'カフェ',
      newDescription: 'ハノイ名物のエッグコーヒー発祥の店。1階がオーダーカウンター、2・3階が座席の趣ある空間。',
      newAddress: 'グエンフーフアン通り39番地、ホアンキエム区、ハノイ'
    },
    {
      name: 'Cha Ca La Vong',
      newName: 'チャーカー・ラーヴォン',
      newCuisine: 'ベトナム料理',
      newDescription: 'ターメリック風味の白身魚をピーナッツとディルと共に味わう郷土料理。メニューは一品のみでサービスが早い。',
      newAddress: 'チャーカー通り14番地、ホアンキエム区、ハノイ'
    },
    {
      name: 'Highway4 Hang Tre',
      newName: 'ハイウェイ４ハンチェー店',
      newCuisine: 'ベトナム創作料理',
      newDescription: 'ベトナム地方料理をアレンジしたメニューと名物ソンティン米酒。温かい雰囲気で集まりに最適。',
      newAddress: 'ハンチェー通り25番地、ホアンキエム区、ハノイ'
    },
    {
      name: 'Sushi Kei Hoan Kiem',
      newName: '寿司けい・ホアンキエム店',
      newCuisine: '和食',
      newDescription: '江戸前スタイルの本格寿司。毎日新鮮な魚を仕入れ。10席のカウンターバーと小さな個室あり。',
      newAddress: 'リータイトー通り12番地、ホアンキエム区、ハノイ'
    },
    {
      name: 'Ramen Tatsu West Lake',
      newName: 'ラーメン辰・タイホー店',
      newCuisine: 'ラーメン',
      newDescription: '12時間煮込んだ豚骨スープが自慢。辛味噌オプションあり。深夜まで営業で少人数に最適。',
      newAddress: 'チックサイ通り101番地、タイホー区、ハノイ'
    },
    {
      name: 'Izakaya Hanami Cau Giay',
      newName: '居酒屋花見・カウザイ店',
      newCuisine: '居酒屋',
      newDescription: '東京スタイルの居酒屋。豊富なおつまみと日本酒。喫煙室とテラス席あり。',
      newAddress: 'チャンタイトン通り25番地、カウザイ区、ハノイ'
    }
  ];

  console.log('🔄 レストラン情報を日本語に変換中...\n');

  for (const update of updates) {
    try {
      const [result] = await conn.query(
        'UPDATE restaurants SET name=?, cuisine=?, description=?, address=? WHERE name=?',
        [update.newName, update.newCuisine, update.newDescription, update.newAddress, update.name]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✅ ${update.name} → ${update.newName}`);
      } else {
        console.log(`⚠️  ${update.name} が見つかりません`);
      }
    } catch (err) {
      console.error(`❌ ${update.name} の更新エラー:`, err.message);
    }
  }

  console.log('\n🎉 変換完了！');
  await conn.end();
}

main().catch(err => {
  console.error('エラー:', err.message);
  process.exit(1);
});
