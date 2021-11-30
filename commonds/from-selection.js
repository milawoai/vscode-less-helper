
const vscode = require('vscode')
const { getSelectedText } = require('../utils/index')
const { parseLess } = require('../utils/transfrom')

exports.transformFromSelection = async function (){
  try {


    const text = await getSelectedText();
    let firstChar = text.trim().substring(0, 1);
    let inputClassName = ''
    if(firstChar === '&' || firstChar === '#') {
      inputClassName = await vscode.window.showInputBox({
        placeHolder: "请输入前缀类名",
        prompt: "当前类型不合法"
      });
      if(inputClassName === ''){
        console.log(inputClassName);
        vscode.window.showErrorMessage('未输入类名，生成的html类名会很奇怪');
      }
      vscode.window.showInformationMessage(inputClassName);
    
    }
    const result = await parseLess(text, inputClassName);
    vscode.window.showInformationMessage('生成成功，请在文件开头查看结果');
    vscode.window.activeTextEditor.edit(editBuilder => {
      const pos = new vscode.Position(0, 0);
      editBuilder.insert(pos, result);
    });
  } catch (error) {
    console.log('transformFromSelection error', error)
    console.log(error);
    vscode.window.showInformationMessage('生成失败, 请打开帮助 -> 切换开发人员工具查看更多信息');
  }
  
}
