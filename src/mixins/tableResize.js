let typeX = false,
  typeY = false;

/**
 * 改变列宽
 * @param el
 * @param dragEl
 * @param vm
 * @param key
 * @param onChangeCol
 */
function changeWidth(el, dragEl, vm, key, onChangeCol) {
  initWidthList(el, vm, key);
  // 鼠标是否按下
  let isDown = false;
  // 记录鼠标按下的初始坐标
  let startX = 0;
  // 记录鼠标按下时虚线的初始坐标
  let dragElStartX = 0;
  // 记录虚线两边列的索引
  let thIndex = [0, 0];
  // 记录虚线可移动的左右长度范围
  let moveRange = [0, 0];
  // 事件处理
  vm.mousemoveW = function (eV) {
    const e = eV || window.event;
    if (
      e.target.tagName !== "TD" &&
      e.target.tagName !== "TH" &&
      e.target.parentElement.parentElement.parentElement !== el
    ) {
      return;
    }
    const x = e.offsetX;
    typeX = checkMouse(e.target, x);
    if (typeX) {
      e.cancelBubble = true;
      e.stopPropagation();
    }
    if (typeX) {
      if (typeX === "left") {
        if (!isDown) {
          dragElStartX = e.target.offsetLeft;
          dragEl.style.left = dragElStartX + "px";
        }
      } else {
        if (!isDown) {
          dragElStartX = e.target.offsetLeft + e.target.offsetWidth;
          dragEl.style.left = dragElStartX + "px";
        }
      }
      if (document.body.style.cursor !== "col-resize") {
        document.body.style.cursor = "col-resize";
      }
    } else if (!isDown && document.body.style.cursor === "col-resize") {
      document.body.style.cursor = "";
    }
    if (isDown) {
      let left = e.screenX - startX;
      if (left > moveRange[1]) {
        left = moveRange[1];
      }
      if (left < moveRange[0]) {
        left = moveRange[0];
      }
      dragEl.style.left = dragElStartX + left + "px";
    }
  };
  vm.mousedownW = function (eV) {
    const e = eV || window.event;
    if (
      e.target.tagName !== "TD" &&
      e.target.tagName !== "TH" &&
      e.target.parentElement.parentElement.parentElement !== el
    ) {
      return;
    }
    const x = e.offsetX;
    typeX = checkMouse(e.target, x);
    if (typeX) {
      e.cancelBubble = true;
      e.stopPropagation();
    }
    if (!typeY && typeX) {
      startX = e.screenX;
      isDown = true;
      dragEl.style.visibility = "visible";
      document.body.style.cursor = "col-resize";
      if (typeX === "left") {
        thIndex[1] = +e.target.getAttribute("c-index").split(",")[1];
        thIndex[0] = thIndex[1] - 1;
      } else {
        const colspan0 = +e.target.getAttribute("colspan") || 1;
        thIndex[0] =
          +e.target.getAttribute("c-index").split(",")[1] + colspan0 - 1;
        thIndex[1] = thIndex[0] + 1;
      }
      const widthList = JSON.parse(JSON.stringify(vm.propData[key]));
      const tableWidth = el.offsetWidth;
      moveRange[0] =
        50 - (parseFloat(widthList[thIndex[0]].width) * tableWidth) / 100;
      moveRange[1] =
        (parseFloat(widthList[thIndex[1]].width) * tableWidth) / 100 - 50;
    }
  };
  vm.mouseupW = function (eV) {
    const e = eV || window.event;
    if (!isDown) {
      return;
    }
    e.cancelBubble = true;
    e.stopPropagation();
    dragEl.style.visibility = "hidden";
    document.body.style.cursor = "";
    isDown = false;
    resetSize();
  };
  // 边缘碰撞校验
  function checkMouse(el, x) {
    const cIndex = el.getAttribute("c-index").split(",");
    if (cIndex[1] === "0") {
      return x > el.offsetWidth - 5 ? "right" : undefined;
    }
    if (!el.nextElementSibling) {
      return x < 5 ? "left" : undefined;
    }
    if (x > el.offsetWidth - 5) {
      return "right";
    }
    if (x < 5) {
      return "left";
    }
  }
  // 更新列宽
  function resetSize() {
    let newList = JSON.parse(JSON.stringify(vm.propData[key]));
    const tableWidth = el.offsetWidth;
    let offWidth = parseInt(dragEl.style.left) - dragElStartX;
    const width0 =
      (parseFloat(newList[thIndex[0]].width) * tableWidth) / 100 + offWidth;
    const width1 =
      (parseFloat(newList[thIndex[1]].width) * tableWidth) / 100 - offWidth;
    newList[thIndex[0]] = {
      width: ((width0 * 100) / tableWidth).toFixed(3) + "%",
      colGuid:newList[thIndex[0]].colGuid
    };
    newList[thIndex[1]] = {
      width: ((width1 * 100) / tableWidth).toFixed(3) + "%",
      colGuid:newList[thIndex[1]].colGuid
    };
    onChangeCol && onChangeCol(newList);
  }
}

/**
 * 改变行高
 * @param el
 * @param dragEl
 * @param vm
 * @param key
 * @param onChangeRow
 */
function changeHeight(el, dragEl, vm, key, onChangeRow) {
  // 鼠标是否按下
  let isDown = false;
  // 记录鼠标按下的初始坐标
  let startY = 0;
  // 记录鼠标按下时虚线的初始坐标
  let dragElStartY = 0;
  // 当前处理的行tr
  let target = null;
  // 记录虚线可向上移动的长度范围
  let moveRange = 0;
  // 事件处理
  vm.mousemoveH = function (eV) {
    const e = eV || window.event;
    if (
      (e.target.tagName === "TD" || e.target.tagName === "TH") &&
      e.target.parentElement.parentElement.parentElement !== el
    ) {
      return;
    }
    const y = e.offsetY;
    typeY = checkMouse(e.target, y);
    if (typeY) {
      e.cancelBubble = true;
      e.stopPropagation();
    }
    if (typeY) {
      if (typeY === "top") {
        if (!isDown) {
          dragElStartY = e.target.parentElement.offsetTop;
          dragEl.style.top = dragElStartY + "px";
        }
      } else {
        if (!isDown) {
          dragElStartY =
            e.target.parentElement.offsetTop +
            e.target.parentElement.offsetHeight;
          dragEl.style.top = dragElStartY + "px";
        }
      }
      if (document.body.style.cursor !== "row-resize") {
        document.body.style.cursor = "row-resize";
      }
    } else if (!isDown && document.body.style.cursor === "row-resize") {
      document.body.style.cursor = "";
    }
    if (isDown) {
      let top = e.screenY - startY;
      if (top < moveRange) {
        top = moveRange;
      }
      dragEl.style.top = dragElStartY + top + "px";
    }
  };
  vm.mousedownH = function (eV) {
    const e = eV || window.event;
    if (
      e.target.tagName !== "TD" &&
      e.target.tagName !== "TH" &&
      e.target.parentElement.parentElement.parentElement !== el
    ) {
      return;
    }
    const y = e.offsetY;
    typeY = checkMouse(e.target, y);
    if (typeY) {
      e.cancelBubble = true;
      e.stopPropagation();
    }
    if (typeY && !typeX) {
      startY = e.screenY;
      isDown = true;
      dragEl.style.visibility = "visible";
      document.body.style.cursor = "row-resize";
      if (typeY === "top") {
        target = e.target.parentElement.previousElementSibling;
      } else {
        target = e.target.parentElement;
      }
      moveRange = 52 - target.offsetHeight;
    }
  };
  vm.mouseupH = function (eV) {
    const e = eV || window.event;
    if (!isDown) {
      return;
    }
    e.cancelBubble = true;
    e.stopPropagation();
    dragEl.style.visibility = "hidden";
    document.body.style.cursor = "";
    isDown = false;
    resetSize();
  };
  // 边缘碰撞校验
  function checkMouse(el, y) {
    const cIndex = el.getAttribute("c-index");
    if (!cIndex || cIndex === "") return;
    const rIndex = el.getAttribute("c-index").split(",")[0];
    if (rIndex === "0") {
      return y > el.offsetHeight - 5 ? "bottom" : undefined;
    }
    if (y > el.offsetHeight - 5) {
      return "bottom";
    }
    if (y < 5) {
      return "top";
    }
  }
  // 更新行高
  function resetSize() {
    let offHeight = parseInt(dragEl.style.top) - dragElStartY;
    const rIndex = +target.children[0].getAttribute("c-index").split(",")[0];
    onChangeRow && onChangeRow(rIndex, target.offsetHeight + offHeight + "px");
  }
}

/**
 * 创建拖动时的虚线dom，并插入table中
 * @param el
 * @param type
 * @returns {HTMLDivElement}
 */
function createDragEl(el, type) {
  const dom = document.createElement("div");
  dom.style.position = "absolute";
  dom.style.display = "block";
  dom.style.visibility = "hidden";
  dom.style.top = "0";
  dom.style.left = "0";
  dom.style.zIndex = "10000";
  if (type === "x") {
    dom.style.height = "100%";
    dom.style.width = "1px";
    dom.style.borderLeft = "1px dashed #000";
  } else {
    dom.style.width = "100%";
    dom.style.height = "1px";
    dom.style.borderTop = "1px dashed #000";
  }
  // ie下空标签不显示，我也不知道为什么...
  // 加点内容就显示了！
  dom.innerHTML = '<span></span>';
  if (
    el.style.position !== "relative" &&
    el.style.position !== "absolute" &&
    el.style.position !== "fixed"
  ) {
    el.style.position = "relative";
  }
  el.appendChild(dom);
  return dom;
}

/**
 * 初始化列宽，将auto、px转%
 * @param el
 * @param vm
 * @param key
 */
function initWidthList(el, vm, key) {
  const tableWidth = el.offsetWidth;
  const widthList = JSON.parse(JSON.stringify(vm.propData[key]));
  let autoNum = 0,
    hasWidth = 0;
  const newList = [];
  vm.__col_number = widthList.length;
  widthList.forEach(({ width, }, index) => {
    if (width !== 0 && (!width || width === "" || width === "auto")) {
      autoNum++;
      newList[index] = null;
    } else if (typeof width === "string" && width.indexOf("%") > 0) {
      if (isNaN(parseFloat(width))) {
        autoNum++;
        newList[index] = null;
      } else {
        const _w = parseFloat(width);
        hasWidth += _w;
        newList[index] = { width: _w.toFixed(3) + "%" };
      }
    } else if (typeof width === "string" && width.indexOf("px") > 0) {
      if (isNaN(parseFloat(width))) {
        autoNum++;
        newList[index] = null;
      } else {
        const _w = (parseFloat(width) * 100) / tableWidth;
        hasWidth += _w;
        newList[index] = { width: _w.toFixed(3) + "%" };
      }
    } else if (isNaN(parseFloat(width))) {
      autoNum++;
      newList[index] = null;
    } else {
      const _w = parseFloat(width);
      hasWidth += _w;
      newList[index] = { width: _w.toFixed(3) + "%" };
    }
  });
  if (hasWidth > 100) {
    for (let i = 0; i < tableWidth.length; i++) {
      if (!newList[i]) {
        newList[i] = { width: 0 };
      } else {
        newList[i] = {
          width: (parseFloat(newList[i].width) / hasWidth).toFixed(3) + "%",
        };
      }
    }
  } else if (autoNum > 0) {
    let autoWidth = ((100 - hasWidth) / autoNum).toFixed(3) + "%";
    for (let i = 0; i < widthList.length; i++) {
      if (!newList[i]) {
        newList[i] = { width: autoWidth };
      }
    }
  }
  vm.propData[key] = newList;
  // vm.$emit("update:" + key, newList);
}

/**
 * 更新列宽, 增加了列，或减少了列
 * @param el
 * @param vm
 * @param key
 * @param onChangeCol
 */
function updateWidthList(el, vm, key, onChangeCol) {
  const tableWidth = el.offsetWidth;
  const widthList = JSON.parse(JSON.stringify(vm.propData[key]));
  const newList = [];
  let oldColNum = vm.__col_number;
  vm.__col_number = widthList.length;
  const k = oldColNum / widthList.length;
  const newWidth = 100 / widthList.length;
  widthList.forEach(({ width,colGuid }, index) => {
    if (width !== 0 && (!width || width === "" || width === "auto")) {
      newList[index] = { width: newWidth.toFixed(3) + "%",colGuid };
    } else if (typeof width === "string" && width.indexOf("%") > 0) {
      const _w = parseFloat(width) * k;
      newList[index] = { width: _w.toFixed(3) + "%",colGuid };
    } else if (typeof width === "string" && width.indexOf("px") > 0) {
      const _w = (parseFloat(width) * 100 * k) / tableWidth;
      newList[index] = { width: _w.toFixed(3) + "%",colGuid };
    } else {
      const _w = parseFloat(width) * k;
      newList[index] = { width: _w.toFixed(3) + "%",colGuid };
    }
  });
  onChangeCol && onChangeCol(newList);
}

export default {
  resize: {
    inserted(el, { value, modifiers }, vnode) {
      // 当前实例
      const vm = vnode.context;
      if (!vm.isDesign) {
        return;
      }

      // 改变列宽
      if (modifiers.x || (!modifiers.x && !modifiers.y)) {
        changeWidth(
          el,
          createDragEl(el, "x"),
          vm,
          value.colList,
          value.onChangeCol
        );
        el.addEventListener("mousemove", vm.mousemoveW);
        el.addEventListener("mousedown", vm.mousedownW);
        el.addEventListener("mouseup", vm.mouseupW);
        el.addEventListener("mouseleave", vm.mouseupW);
      }
      // 改变行高
      if (modifiers.y || (!modifiers.x && !modifiers.y)) {
        changeHeight(
          el,
          createDragEl(el, "y"),
          vm,
          value.rowList,
          value.onChangeRow
        );
        document.body.addEventListener("mousemove", vm.mousemoveH);
        el.addEventListener("mousedown", vm.mousedownH);
        document.body.addEventListener("mouseup", vm.mouseupH);
      }
    },
    update(el, { value, modifiers }, vnode) {
      const vm = vnode.context;
      if (!vm.isDesign) {
        return;
      }
      // 改变列宽
      if (modifiers.x || (!modifiers.x && !modifiers.y)) {
        if (vm.__col_number !== vm.propData[value.colList].length) {
          updateWidthList(el, vm, value.colList, value.onChangeCol);
        }
      }
    },
    unbind(el, { modifiers }, vnode) {
      const vm = vnode.context;
      if (!vm.isDesign) {
        return;
      }
      // 改变列宽
      if (modifiers.x || (!modifiers.x && !modifiers.y)) {
        el.removeEventListener("mousemove", vm.mousemoveW);
        el.removeEventListener("mousedown", vm.mousedownW);
        el.removeEventListener("mouseup", vm.mouseupW);
        el.removeEventListener("mouseleave", vm.mouseupW);
      }
      // 改变行高
      if (modifiers.y || (!modifiers.x && !modifiers.y)) {
        document.body.removeEventListener("mousemove", vm.mousemoveH);
        el.removeEventListener("mousedown", vm.mousedownH);
        document.body.removeEventListener("mouseup", vm.mouseupH);
      }
    },
  },
};
