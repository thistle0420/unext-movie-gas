function getPages(payload){
  let response = UrlFetchApp.fetch(
    "https://cc.unext.jp/",
    {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );
  let json = JSON.parse(response.getContentText("utf-8"));
  return json.data.webfront_searchVideo.pageInfo.pages;
}

function getTitlesPerPage(payload){
  let response = UrlFetchApp.fetch(
    "https://cc.unext.jp/",
    {
      method: "POST",
      contentType: "application/json",
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    }
  );
  let json = JSON.parse(response.getContentText());
  return json.data.webfront_searchVideo.titles;
}

function getTitles(categoryCode) {
  let payload = {
    'operationName': 'cosmo_VideoCategory',
    'variables': {
        'categoryCode': categoryCode,
        'page': 1,
        'filterSaleType': 'MIHOUDAI',
        'sortOrder': 'POPULAR',
    },
    'query': 'query cosmo_VideoCategory($categoryCode: ID!, $page: Int!, $sortOrder: PortalSortOrder!, $dubSubFilter: DubSubType, $filterSaleType: SaleType) {\n  webfront_searchVideo(\n    categoryCode: $categoryCode\n    page: $page\n    pageSize: 30\n    sortOrder: $sortOrder\n    dubSubFilter: $dubSubFilter\n    filterSaleType: $filterSaleType\n  ) {\n    pageInfo {\n      page\n      pageSize\n      pages\n      results\n      __typename\n    }\n    titles {\n      ...TitleCard\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment TitleCard on Title {\n  id\n  titleName\n  isNew\n  catchphrase\n  rate\n  titleComment\n  titleHeading\n  productionYear\n  updateOfWeek\n  lastEpisode\n  nfreeBadge\n  hasSubtitle\n  hasDub\n  paymentBadgeList {\n    code\n    __typename\n  }\n  productLineupCodeList\n  thumbnail {\n    standard\n    __typename\n  }\n  exclusiveBadgeCode\n  __typename\n}\n',
  };

  let pages = getPages(payload);
  let titles = []
  for (let i=1; i<=pages; i++) {
    console.log(i, "/", pages);
    payload.variables.page = i;
    let titlesPerPage = getTitlesPerPage(payload);
    titlesPerPage.forEach((title)=>{
      titles.push([
        title.id,
        title.titleName,
        title.isNew,
        title.catchphrase,
        title.rate,
        title.productionYear,
        title.thumbnail.standard
      ]);
    });
  }

  return titles;
}

function writeSheet(sheetName, titles){
  const spreadsheetId = '1s1GcT7PoKuIU4kcCRDAjyXU-pi88e7QrdDKaewqLU_U';
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  sheet.clear();

  sheet.appendRow([
    'ID',
    'タイトル',
    '新作',
    'キャッチフレーズ',
    'レート',
    '公開日',
    'サムネイル'
  ]);

  const row = titles.length;
  const col = titles[0].length;
  const range = sheet.getRange(2, 1, row, col);
  range.setValues(titles);
}

function getWesternMovie(){
  writeSheet("洋画", getTitles('MNU0000141'));
}
function getJapaneseMovie(){
  writeSheet("邦画", getTitles('MNU0000709'));
}
function getWesternDrama(){
  writeSheet("海外ドラマ", getTitles('MNU0000725'));
}
function getJapaneseDrama(){
  writeSheet("国内ドラマ", getTitles('MNU0000753'));
}
function getAnime(){
  writeSheet("アニメ", getTitles('MNU0000768'));
}

function main() {
  writeSheet("洋画", getTitles('MNU0000141'));
  writeSheet("邦画", getTitles('MNU0000709'));
  writeSheet("海外ドラマ", getTitles('MNU0000725'));
  writeSheet("国内ドラマ", getTitles('MNU0000753'));
  writeSheet("アニメ", getTitles('MNU0000768'));
}
