var less = require('less')
var fs = require('fs')

function astTreeWalk(ast, parent) {
  const { root, selectors } = ast
  var tree = {
    parent: parent,
    children: []
  }
  if (selectors && selectors.length > 0) {
    let pValues = parent.values
    let selectorsItem = selectors.map(selector => {
      const { elements } = selector
      let items = elements.map(element => {
        return {
          value: element.value,
          index: element._index
        }
      })
      let distStr = items.reduce((prevItem, currItem) => {
        // get last item
        if (!prevItem || !prevItem.value) {
          return currItem
        }
        let prev = prevItem.value
        let curr = currItem.value
        let last = prev.substr(prev.length - 1, 1)
        if (curr.trim().indexOf(':') === 0) {
          if (last === '&') {
            let prevStr = prev.substr(0, prev.length - 1)
            return {
              value: `${prevStr}`,
              index: prevItem.index
            }
          } else {
            return prevItem
          }
        }
        if (last === '&') {
          if (currItem.index - prevItem.index === 1) {
            return {
              value: `${prev}${curr}`,
              index: currItem.index
            }
          } else { 
            let prevStr = prev.substr(0, prev.length - 1)
            if (prevStr) {
              prevStr = prevStr + ','
            }
            return {
              value: `${prevStr}${curr}`,
              index: currItem.index
            }
          }
        } else {
          return {
            value: `${prev},${curr}`,
            index: currItem.index
          }
        }
      })
      items = distStr.value.split(',')
      if (!items || items.length <= 0) {
        return null
      }
      let combineItems = []
      items.forEach((sonItem) => {
        // console.log('typeof sonItem: ' + typeof sonItem)
        if (sonItem.indexOf('&') > -1) {
          if (pValues.length > 0) {
            let parentItem = pValues[0]
            if (typeof parentItem === 'string') {
              combineItems.push(sonItem.replace('&', parentItem))
            } else if (Array.isArray(parentItem)) {
              if (parentItem.length > 0) {
                combineItems.push(sonItem.replace('&', parentItem[0]))
              }
            }
          }
          
        } else {
          combineItems.push(sonItem)
        }
      })
      return combineItems
    })
    tree.values = selectorsItem
  } else if (root) {
    tree.values = [['']]
  }
  if (ast.rules) {
    ast.rules.forEach(node => {
      tree.children.push(astTreeWalk(node, tree))
    })
  }
  tree.children = tree.children.filter(child => child !== null)
  if (tree.values) {
    return tree
  }
  return null
}


function genHtml(ast, html, layer = 0) {
  const { values, parent, children } = ast
  var html = ''
  let prefix = ''
  for (let i = 0; i < layer; i++) {
    prefix += '  '
  }
  if (values) {
    let flatValues = values.flatMap((item) => item)
    flatValues.forEach(value => {
        let isValueTag = false
        if (value) {
          html += prefix
          if (value.indexOf('.') === 0)  {
            html += '<div class="' + value.substr(1, value.length - 1) + '">\n'
          } else if (value.indexOf('#') === 0) {
            html += '<div id="' + value.substr(1, value.length - 1) + '">\n'
          } else {
            isValueTag = true
            html += '<' + value + '>\n' 
          }
        }
        if (children && children.length > 0) {
          children.forEach(child => {
            html += genHtml(child, html, layer + 1)
          })
        }
        if (value) {
          html += prefix
          html += isValueTag ? '</' + value + '>\n'  : '</div>\n'
        }
    })
  }
  return html
}

exports.parseLess = function(text) {
  return new Promise((resolve, reject) => {
    less.parse(text, {}, function(e, tree) {
      if (e) {
        console.log('parseLess: err ')
        console.log(e)
        reject(e)
      }
      let result = astTreeWalk(tree)
      let html = genHtml(result, '', 0)
      resolve(html)
    })
  })
}