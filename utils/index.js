const copyPaste = require('copy-paste') ;
const vscode = require('vscode');

// 获取粘贴板内容
exports.getClipboardText = function() {
  return new Promise((resolve, reject) => {
    copyPaste.paste((err, text) => {
      if (err !== null) {
        reject(err);
      }
      resolve(text);
    });
  });
}

// 获取选择的文本
exports.getSelectedText = function() {
  const { selection, document } = vscode.window.activeTextEditor;
  return Promise.resolve(document.getText(selection).trim());
}