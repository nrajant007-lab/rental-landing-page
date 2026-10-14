import type { sheets_v4 } from 'googleapis';
export function sheetLayout(sheetId: number): sheets_v4.Schema$Request[] {
 const range = {sheetId,startRowIndex:0,startColumnIndex:0,endColumnIndex:16};
 const teal = {red:0.067,green:0.25,blue:0.23};
 return [
  {updateSheetProperties:{properties:{sheetId,gridProperties:{frozenRowCount:1,hideGridlines:true}},fields:'gridProperties.frozenRowCount,gridProperties.hideGridlines'}},
  {repeatCell:{range,cell:{userEnteredFormat:{textFormat:{fontFamily:'Arial',fontSize:10},verticalAlignment:'MIDDLE',wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},
  {repeatCell:{range:{...range,endRowIndex:1},cell:{userEnteredFormat:{backgroundColor:teal,textFormat:{bold:true,foregroundColor:{red:1,green:1,blue:1},fontSize:10,fontFamily:'Arial'},verticalAlignment:'MIDDLE',wrapStrategy:'WRAP'}},fields:'userEnteredFormat'}},
  {updateDimensionProperties:{range:{sheetId,dimension:'ROWS',startIndex:0,endIndex:1},properties:{pixelSize:48},fields:'pixelSize'}},
  {updateDimensionProperties:{range:{sheetId,dimension:'COLUMNS',startIndex:0,endIndex:16},properties:{pixelSize:155},fields:'pixelSize'}},
  ...[0,3,5].map(index=>({updateDimensionProperties:{range:{sheetId,dimension:'COLUMNS',startIndex:index,endIndex:index+1},properties:{pixelSize:index===5?300:270},fields:'pixelSize'}})),
  {repeatCell:{range:{sheetId,startRowIndex:1,startColumnIndex:9,endColumnIndex:13},cell:{userEnteredFormat:{numberFormat:{type:'NUMBER',pattern:'"NPR "#,##0'},horizontalAlignment:'RIGHT'}},fields:'userEnteredFormat.numberFormat,userEnteredFormat.horizontalAlignment'}},
  {setBasicFilter:{filter:{range}}},
 ];
}
