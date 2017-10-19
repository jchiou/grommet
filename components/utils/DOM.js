'use strict';

exports.__esModule = true;
exports.filterByFocusable = filterByFocusable;
exports.findScrollParents = findScrollParents;
exports.getBodyChildElements = getBodyChildElements;
exports.getNewContainer = getNewContainer;
function filterByFocusable(elements) {
  return Array.prototype.filter.call(elements || [], function (element) {
    var currentTag = element.tagName.toLowerCase();
    var validTags = /(svg|a|area|input|select|textarea|button|iframe|div)$/;
    var isValidTag = currentTag.match(validTags) && element.focus;
    if (currentTag === 'a') {
      return isValidTag && element.childNodes.length > 0 && element.getAttribute('href');
    } else if (currentTag === 'svg' || currentTag === 'div') {
      return isValidTag && element.hasAttribute('tabindex');
    }
    return isValidTag;
  });
}

function findScrollParents(element, horizontal) {
  var result = [];
  if (element) {
    var parent = element.parentNode;
    while (parent && parent.getBoundingClientRect) {
      var rect = parent.getBoundingClientRect();
      // 10px is to account for borders and scrollbars in a lazy way
      if (horizontal) {
        if (rect.width && parent.scrollWidth > rect.width + 10) {
          result.push(parent);
        }
      } else if (rect.height && parent.scrollHeight > rect.height + 10) {
        result.push(parent);
      }
      parent = parent.parentNode;
    }
    // last scrollable element will be the document 
    // if nothing else is scrollable in the page
    if (result.length === 0) {
      result.push(document);
    }
  }
  return result;
}

function getBodyChildElements() {
  var excludeMatch = /^(script|link)$/i;
  var children = [];
  [].forEach.call(document.body.children, function (node) {
    if (!excludeMatch.test(node.tagName)) {
      children.push(node);
    }
  });
  return children;
}

function getNewContainer() {
  // setup DOM
  var container = document.createElement('div');
  document.body.appendChild(container, document.body.firstChild);
  return container;
}

var setTabIndex = exports.setTabIndex = function setTabIndex(tabIndex) {
  return function (element) {
    element.setAttribute('tabindex', tabIndex);
  };
};

var copyAttribute = exports.copyAttribute = function copyAttribute(source) {
  return function (target) {
    return function (element) {
      element.setAttribute(target, element.getAttribute(source));
    };
  };
};

var deleteAttribute = function deleteAttribute(attribute) {
  return function (element) {
    return element.removeAttribute(attribute);
  };
};

var unsetTabIndex = setTabIndex(-1);
var saveTabIndex = copyAttribute('tabindex')('data-g-tabindex');
var restoreTabIndex = copyAttribute('data-g-tabindex')('tabindex');
var deleteTabIndex = deleteAttribute('tabindex');
var deleteTabIndexCopy = deleteAttribute('data-g-tabindex');

var makeNodeFocusable = exports.makeNodeFocusable = function makeNodeFocusable(node) {
  node.setAttribute('aria-hidden', false);
  // allow children to receive focus again
  filterByFocusable(node.getElementsByTagName('*')).forEach(function (child) {
    if (child.hasAttribute('data-g-tabindex')) {
      restoreTabIndex(child);
    } else {
      deleteTabIndex(child);
    }
    deleteTabIndexCopy(child);
  });
};

var makeNodeUnfocusable = exports.makeNodeUnfocusable = function makeNodeUnfocusable(node) {
  node.setAttribute('aria-hidden', true);
  // prevent children to receive focus
  filterByFocusable(node.getElementsByTagName('*')).forEach(function (child) {
    if (child.hasAttribute('tabindex')) {
      saveTabIndex(child);
    }
    unsetTabIndex(child);
  });
};

exports.default = {
  copyAttribute: copyAttribute,
  filterByFocusable: filterByFocusable,
  findScrollParents: findScrollParents,
  makeNodeFocusable: makeNodeFocusable,
  makeNodeUnfocusable: makeNodeUnfocusable,
  getBodyChildElements: getBodyChildElements,
  getNewContainer: getNewContainer,
  setTabIndex: setTabIndex,
  unsetTabIndex: unsetTabIndex
};