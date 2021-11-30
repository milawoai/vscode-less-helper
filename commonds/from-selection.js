
const vscode = require('vscode')
const { getSelectedText } = require('../utils/index')
const { parseLess } = require('../utils/transfrom')

exports.transformFromSelection = async function (){
  try {
    const text = await getSelectedText();
    console.log('transformFromSelection text', text)
    const result = await parseLess(text);
    console.log('transformFromSelection text', result)
    vscode.window.showInformationMessage(result);
    // const newUri = Uri.parse(uri.toString().replace('.less', '.css'));
   // window.activeTextEditor.edit((editBuilder) => { editBuilder.replace(newUri, result); });  // 替换文件内容     
  } catch (error) {
    console.log('transformFromSelection error', error)
    console.log(error);
  }
  
}
