<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="idm-table-layout"
    :class="getCss"
  >
    <!--
      组件内部容器
      增加class="drag_container" 代表内部可存放组件容器 必选
      增加idm-ctrl-inner 代表内部容器组件（可定义单独的属性，只支持定义一类的属性,一个组件内只包含一种） 可选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选，建议从1开始
    -->
    <!-- <div>v1.1.0{{$root.propData}}</div>
    <div class="drag_container" :idm-ctrl-id="moduleObject.id" idm-container-index="1">
      
    </div>
    <div class="drag_container" :idm-ctrl-id="moduleObject.id" idm-container-index="2">
      
    </div> -->
    <div
      class="idm-table-layout-box"
      @contextmenu="onContextmenu"
      @mousedown="mouseDownHandler"
      @mouseup="mouseUpHandler"
      @mousemove="mouseMoveHandler"
    >
      <table
        :style="{
          'border-collapse': propData.tableBorderCollapse ? 'collapse' : 'separate',
        }"
        ref="table"
        v-resize.x.y="{
          colList: 'columnsList',
          rowList: 'tableRows',
          onChangeCol: onChangeCol,
          onChangeRow: onChangeRow,
        }"
      >
        <thead>
          <tr v-if="propData.columnsList && rows && rows.length > 0">
            <th
              v-for="(col, $index) in propData.columnsList"
              :key="$index"
              :style="{ width: col.width || 'auto' }"
            ></th>
          </tr>
        </thead>
        <tbody slot-name="default">
          <tr
            v-for="(item, rowIndex) in propData.tableRows"
            :key="rowIndex"
            :style="{ height: item.height }"
            :class="[propData.tableBdShow ? '' : 'idm-no-border',item.rowGuid,item.rowClass]"
            :r-index="rowIndex"
          >
            <td
              class="drag_container idm_no_select_container"
              v-for="(col, cellIndex) in item.cols"
              :class="[col.props&&col.props.cellClass]"
              :key="cellIndex"
              :style="[
                {
                  width:
                    col.colspan > 1
                      ? 'auto'
                      : col.width === 'number'
                      ? col.width + 'px'
                      : col.width || 'auto',
                  cursor:col.props&&col.props.clickFunction&&col.props.clickFunction.length>0?'pointer':'default'
                },
                col.cellStyle,
                col.cellBorderStyle,
                getThemeCellStyle(col),
              ]"
              :c-index="rowIndex + ',' + col.cellIndex"
              :rowspan="col.rowspan"
              :colspan="col.colspan"
              :align="col.cellAttr && col.cellAttr.align"
              :valign="col.cellAttr && col.cellAttr.valign"
              @click="colClickHandle(item, col, rowIndex, cellIndex)"
              idm-ctrl-inner
              :idm-ctrl-id="moduleObject.id"
              :idm-container-index="item.rowGuid + '_' + col.colGuid"
              :idm-refresh-container="`td-${item.rowGuid}-${col.colGuid}`"
            >
                <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
                <slot :name="moduleObject.id+item.rowGuid + '_' + col.colGuid"></slot>
            </td>
          </tr>
        </tbody>
      </table>
      <div
        v-if="isDesign"
        v-show="rangeWrap.show"
        :style="{
          height: rangeWrap.height + 'px',
          width: rangeWrap.width + 'px',
          top: rangeWrap.top + 'px',
          left: rangeWrap.left + 'px',
        }"
        class="selected-range"
      ></div>
    </div>
  </div>
</template>
<script>
import directives from "../mixins/tableResize";
export default {
  components: {},
  name: "ITableLayout",
  data() {
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr ||{
        tableBdShow: true,
        tableBdStyle: "solid",
        tableBdSize: 1,
        tableOutBdShow: ["top", "right", "bottom", "left"],
        columnsList: [
            {
                "colGuid":"W4hwHespe1BXsBA3",
                "width":"auto"
            },
            {
                "colGuid":"jGKlt5iCk5EwxbT3",
                "width":"auto"
            },
            {
                "colGuid":"OY6SkGIeXMSuCTQG",
                "width":"auto"
            },
            {
                "colGuid":"wRulSFevImJQnONq",
                "width":"auto"
            }
        ],
        tableRows: [
            {
                "rowGuid":"MgGC8YoYVjetIr1W",
                "height":"52px",
                "rowIndex":0,
                "cols":[
                    {
                        "colGuid":"XkF2SjFUlEZBBFAr",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 0,
                        "rowIndex":0,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"5xknWne15GMOTKaJ",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 1,
                        "rowIndex":0,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"wuCENwSP2kTxjdJA",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 2,
                        "rowIndex":0,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"BndNcxzz8T9GUVm4",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 3,
                        "rowIndex":0,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    }
                ]
            },
            {
                "rowGuid":"sSgnJzd60VM7uOP3",
                "height":"52px",
                "rowIndex":1,
                "cols":[
                    {
                        "colGuid":"P2hg20ok7LKC8xA0",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 0,
                        "rowIndex":1,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"28VbMi5V3Spz2Adk",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 1,
                        "rowIndex":1,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"LUv21pgWOGDwjP2m",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 2,
                        "rowIndex":1,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"30CMOERGir7btUNU",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 3,
                        "rowIndex":1,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    }
                ]
            },
            {
                "rowGuid":"Ill8kZVUeAGhGbje",
                "height":"52px",
                "rowIndex":2,
                "cols":[
                    {
                        "colGuid":"iJ0UYGRVWdCCPOh9",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 0,
                        "rowIndex":2,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"fA1ap3cIdl48xTZK",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 1,
                        "rowIndex":2,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"KuSOLREIUAOWv56V",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 2,
                        "rowIndex":2,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"duc6tUwwLvbYjASc",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 3,
                        "rowIndex":2,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    }
                ]
            },
            {
                "rowGuid":"cFsaOtV3hq4U4kff",
                "height":"52px",
                "rowIndex":3,
                "cols":[
                    {
                        "colGuid":"MDWmRxHGldVhb7Af",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 0,
                        "rowIndex":3,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"BYypuvo0IUmXHxQg",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 1,
                        "rowIndex":3,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"vq7WLobG4NEYfv7g",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 2,
                        "rowIndex":3,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    },
                    {
                        "colGuid":"vNcBmIT8rikrTO2Y",
                        "width": "auto",
                        "rowspan": 1,
                        "colspan": 1,
                        "cellIndex": 3,
                        "rowIndex":3,
                        "cellAttr": {
                            "align": "",
                            "valign": ""
                        },
                        "cellStyle": {},
                        "cellBorderStyle": {}
                    }
                ]
            }
        ],
      },
      innerAttr: this._propData?.innerAttr||this.$root?.propData?.innerAttr || [],

      isDesign: false,

      rangeWrap: {
        show: false,
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        selected: [],
      },
      allCells: {},
      matrix: [],
      isDown: false,
      downCell: null,
      cellNums: 0,
      cellZIndex: 1,

      rowsInfo: [],
      rightclickInfo: {},
    };
  },
  directives,
  props: {
    _moduleObject: Object,
    _propData: Object,
    slots: {
      type: Array,
      default() {
        return [
          {
            name: "default",
            controls: [],
          },
        ];
      },
    },
  },
  computed: {
    rows() {
      return this.getRows();
    },
    getCss() {
      return [
        this.propData.tableBdShow ? "" : "idm-no-border",
        this.propData.fixedLayout ? "idm-table-fixed" : "",
        this.propData.tableBdStyle
          ? "idm-table-border-style-" + this.propData.tableBdStyle
          : "",
        (this.propData.tableOutBdShow || []).indexOf("top") == -1
          ? "idm-no-top-border"
          : "",
        (this.propData.tableOutBdShow || []).indexOf("bottom") == -1
          ? "idm-no-bottom-border"
          : "",
        (this.propData.tableOutBdShow || []).indexOf("left") == -1
          ? "idm-no-left-border"
          : "",
        (this.propData.tableOutBdShow || []).indexOf("right") == -1
          ? "idm-no-right-border"
          : "",
        this.isDesign ? "idm-dev-mode" : "idm-production-mode",
      ];
    },
  },
  created() {
    this.moduleObject = this._moduleObject||this.$root.moduleObject;
    // this.isDesign = true;
    this.isDesign = IDM.env_dev ? this.moduleObject.env == "develop" : true;
    // console.log(this.moduleObject)
    this.convertAttrToStyleObject();
    this.resetColWidth();
  },
  mounted() {
    //直接使用组件此处的回调必须的
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
    if (this.isDesign) {
      parseMatrix.call(this);
    }
  },
  updated() {
    if (this.isDesign) {
      updateRangeWrap.call(this, this.rangeWrap.selected);
    }
  },
  destroyed() {},
  watch: {},
  methods: {
    propDataChangeSync() {
      IDM.develop &&
        IDM.develop.externalMixAttributeChangeHandle(
          { tableRows: this.propData.tableRows, columnsList: this.propData.columnsList },
          this.moduleObject.packageid,
          -1,
          false
        );
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.innerAttr = propData.innerAttr || [];
      this.convertAttrToStyleObject();
    },
    colClickHandle(row, cell, rowIndex, cellIndex) {
      if (cell.props?.clickFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [
          cell.props?.clickFunction,
          {
            row,
            cell,
            rowIndex,
            cellIndex,
          },
        ]);
      }
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      //整体组件的
      let themeColor = this.getCurrentThemeRangColorValue("global"); //返回颜色值
      let themeBdColor = this.getCurrentThemeRangBdColorValue("global"); //返回颜色值
      let themeBgColor = this.getCurrentThemeRangBgColorValue("global"); //返回对象{}

      //应用主题
      if (Object.keys(themeBgColor || {}).length) {
        Object.assign(styleObject, themeBgColor);
      }
      //应用文字
      if (themeColor) {
        styleObject.color = themeColor;
      }

      const keyList = [
        "width",
        "height",
        "box",
        "border",
        "font",
        "boxShadow",
        "bgColor",
        "tableBdSize",
        "tableBox",
      ];
      for (const iKey in keyList) {
        const key = keyList[iKey];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "boxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
            case "tableBdSize":
              IDM.setStyleToPageHead(
                `${this.moduleObject.id}>.idm-table-layout-box>table>tbody>tr>td, 
              #${this.moduleObject.id}>.idm-table-layout-box>table>tbody>tr:first-child>td`,
                {
                  "border-width": element + "px",
                },
                "tableBdSize-" + this.moduleObject.id
              );
              break;
            case "tableBox":
              let cellStyle = {};
              IDM.style.setBoxStyle(cellStyle, element)
              IDM.setStyleToPageHead(
                `${this.moduleObject.id}>.idm-table-layout-box>table>tbody>tr>td`,
                cellStyle,
                "tableBox-" + this.moduleObject.id
              );
              break;
          }
        }
      }
      if (Object.keys(this.propData.bgList?.style || {}).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }
      //应用边框
      const bdColorExists =
        styleObject["border-top-color"] ||
        styleObject["border-bottom-color"] ||
        styleObject["border-left-color"] ||
        styleObject["border-right-color"];
      if (!bdColorExists && themeBdColor) {
        styleObject["border-color"] = themeBdColor;
      }
      IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      this.convertAttrToThemeStyleObject();
    },
    convertAttrToThemeStyleObject() {
      //整体表格的
      let themeBdColor = this.propData.tableBdColor?.hex8
        ? IDM.hex8ToRgbaString(this.propData.tableBdColor.hex8)
        : this.getCurrentThemeRangBdColorValue("table"); //返回颜色值
      let themeBgColor = this.getCurrentThemeRangBgColorValue("table"); //返回对象{}
      //应用边框
      if (themeBdColor) {
        //     .idm-table-layout>.idm-table-layout-box {
        //     &>table {
        //         &>tbody>tr {
        //             >td {
        //                 border: 1px solid #e6e6e6;
        //                 border-top: 1px solid transparent;
        //                 border-left: 1px solid transparent;
        //                 &:first-child {
        //                     border-left: 1px solid #e6e6e6;
        //                 }
        //             }
        //             &:first-child>td {
        //                 border-top: 1px solid #e6e6e6;
        //             }
        //         }
        //     }
        // }
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ".idm-table-layout>.idm-table-layout-box>table>tbody>tr>td",
          {
            "border-color": themeBdColor,
            "border-top-color": "transparent",
            "border-left-color": "transparent",
          },
          this.moduleObject.id + "_table_all"
        );
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ".idm-table-layout>.idm-table-layout-box>table>tbody>tr>td:first-child",
          {
            "border-left-color": themeBdColor,
          },
          this.moduleObject.id + "_table_left"
        );
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ".idm-table-layout>.idm-table-layout-box>table>tbody>tr:first-child>td",
          {
            "border-top-color": themeBdColor,
          },
          this.moduleObject.id + "_table_top"
        );
      }
      //表格背景
      if (themeBgColor) {
        IDM.setStyleToPageHead(
          this.moduleObject.id + ">.idm-table-layout-box>table",
          themeBgColor
        );
      }
      //单元格的
    },
    getThemeCellStyle(col) {
      if (this.isDesign) {
        return {};
      }
      //整体组件的
      let themeColor = this.getCurrentThemeRangColorValue("cell"); //返回颜色值
      let themeBdColor = this.getCurrentThemeRangBdColorValue("cell"); //返回颜色值
      let themeBgColor = this.getCurrentThemeRangBgColorValue("cell"); //返回对象{}
      let styleObject = {};
      if (col.openTdThemeBdColor === true && themeBdColor) {
        //边框颜色覆盖
        if (col.cellBorderStyle["border-bottom"]) {
          styleObject["border-bottom-color"] = themeBdColor;
        }
        if (col.cellBorderStyle["border-top"]) {
          styleObject["border-top-color"] = themeBdColor;
        }
        if (col.cellBorderStyle["border-left"]) {
          styleObject["border-left-color"] = themeBdColor;
        }
        if (col.cellBorderStyle["border-right"]) {
          styleObject["border-right-color"] = themeBdColor;
        }
      }
      if (col.openTdThemeFontColor === true && themeColor) {
        //文字颜色
        if (col.cellStyle["color"]) {
          styleObject["color"] = themeBdColor;
        }
      }
      if (col.openTdThemeBgColor === true && themeBgColor) {
        //背景
        if (col.cellStyle["background-color"] || col.cellStyle["background"]) {
          Object.assign(styleObject, themeBgColor);
        }
      }
      return styleObject;
    },
    /**
     * 根据范围key获取颜色值
     * @param {*} rangKey
     * @returns
     */
    getCurrentThemeRangColorValue(rangKey) {
      const styleRang = this.getThemeStyleUseRang();
      const themeCssObject = this.getCurrentThemeCssObject();
      if (styleRang.mainColorRang?.includes(rangKey)) {
        return themeCssObject.mainColor;
      } else if (styleRang.minorColorRang?.includes(rangKey)) {
        return themeCssObject.minorColor;
      } else if (styleRang.lowColorRang?.includes(rangKey)) {
        return themeCssObject.lowColor;
      } else if (styleRang.fourColorRang?.includes(rangKey)) {
        return themeCssObject.fourColor;
      }
      return "";
    },
    /**
     * 根据范围key获取背景颜色值
     * @param {*} rangKey
     * @returns
     */
    getCurrentThemeRangBgColorValue(rangKey) {
      const styleRang = this.getThemeStyleUseRang();
      const themeCssObject = this.getCurrentThemeCssObject();
      let styleObject = {};
      if (styleRang.mainBgColorRang?.includes(rangKey)) {
        styleObject["background-color"] = themeCssObject.mainBgColor;
        Object.assign(styleObject, themeCssObject.mainBgList);
      } else if (styleRang.minorBgColorRang?.includes(rangKey)) {
        styleObject["background-color"] = themeCssObject.minorBgColor;
        Object.assign(styleObject, themeCssObject.minorBgList);
      } else if (styleRang.lowBgColorRang?.includes(rangKey)) {
        styleObject["background-color"] = themeCssObject.lowBgColor;
        Object.assign(styleObject, themeCssObject.lowBgList);
      }
      return styleObject;
    },
    /**
     * 根据范围key获取边框颜色值
     * @param {*} rangKey
     * @returns
     */
    getCurrentThemeRangBdColorValue(rangKey) {
      const styleRang = this.getThemeStyleUseRang();
      const themeCssObject = this.getCurrentThemeCssObject();
      if (styleRang.mainBdColorRang?.includes(rangKey)) {
        return themeCssObject.mainBdColor;
      } else if (styleRang.minorBdColorRang?.includes(rangKey)) {
        return themeCssObject.minorBdColor;
      } else if (styleRang.lowBdColorRang?.includes(rangKey)) {
        return themeCssObject.lowBdColor;
      }
      return "";
    },
    /**
     * 获取主题各种样式使用范围
     * @returns
     */
    getThemeStyleUseRang() {
      return {
        mainColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "mainColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        minorColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "minorColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        lowColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "lowColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        fourColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "fourColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        mainBdColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "mainBdColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        minorBdColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "minorBdColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        lowBdColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "lowBdColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        mainBgColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "mainBgColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        minorBgColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "minorBgColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
        lowBgColorRang: IDM.getAttrVarBindResultData(
          this,
          this.propData,
          "lowBgColorRang",
          this.moduleObject,
          "controlObject",
          {}
        ),
      };
    },
    /**
     * 公共主题样式处理函数
     */
    getCurrentThemeCssObject() {
      var themeList = this.propData.themeList;
      if (!themeList) {
        return;
      }
      let rtnStyleObject = {};
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i];
        //item.key：为主题样式的key
        //item.mainColor：主要颜色值
        //item.minorColor：次要颜色值
        if (item.key != IDM.theme.getCurrentThemeInfo()) {
          //此处比对是不渲染输出不用的样式，如果页面会刷新就可以把此处放开
          continue;
        }
        rtnStyleObject["mainColor"] =
          item.mainColor && item.mainColor.hex8
            ? IDM.hex8ToRgbaString(item.mainColor.hex8)
            : "";
        rtnStyleObject["minorColor"] =
          item.minorColor && item.minorColor.hex8
            ? IDM.hex8ToRgbaString(item.minorColor.hex8)
            : "";
        rtnStyleObject["lowColor"] =
          item.lowColor && item.lowColor.hex8
            ? IDM.hex8ToRgbaString(item.lowColor.hex8)
            : "";
        rtnStyleObject["fourColor"] =
          item.fourColor && item.fourColor.hex8
            ? IDM.hex8ToRgbaString(item.fourColor.hex8)
            : "";
        rtnStyleObject["mainBdColor"] =
          item.mainBdColor && item.mainBdColor.hex8
            ? IDM.hex8ToRgbaString(item.mainBdColor.hex8)
            : "";
        rtnStyleObject["minorBdColor"] =
          item.minorBdColor && item.minorBdColor.hex8
            ? IDM.hex8ToRgbaString(item.minorBdColor.hex8)
            : "";
        rtnStyleObject["lowBdColor"] =
          item.lowBdColor && item.lowBdColor.hex8
            ? IDM.hex8ToRgbaString(item.lowBdColor.hex8)
            : "";
        rtnStyleObject["mainBgColor"] =
          item.mainBgColor && item.mainBgColor.hex8
            ? IDM.hex8ToRgbaString(item.mainBgColor.hex8)
            : "";
        rtnStyleObject["minorBgColor"] =
          item.minorBgColor && item.minorBgColor.hex8
            ? IDM.hex8ToRgbaString(item.minorBgColor.hex8)
            : "";
        rtnStyleObject["lowBgColor"] =
          item.lowBgColor && item.lowBgColor.hex8
            ? IDM.hex8ToRgbaString(item.lowBgColor.hex8)
            : "";
        rtnStyleObject["mainBgList"] = Object.keys(item.mainBgList?.style || {}).length
          ? item.mainBgList.style
          : {};
        rtnStyleObject["minorBgList"] = Object.keys(item.minorBgList?.style || {}).length
          ? item.minorBgList.style
          : {};
        rtnStyleObject["lowBgList"] = Object.keys(item.lowBgList?.style || {}).length
          ? item.lowBgList.style
          : {};
      }
      return rtnStyleObject;
    },
    /**
     * 获取主题样式的前缀名称
     * @returns
     */
    getThemeNamePrefix() {
      const themeNamePrefix =
        IDM.setting &&
        IDM.setting.applications &&
        IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : "idm-theme-";
      return themeNamePrefix;
    },
    onContextmenu(e) {
      if (!this.isDesign) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      let m = parseMatrix.call(this);
      let {
        maxRowIndex,
        minRowIndex,
        maxCellIndex,
        minCellIndex,
      } = getRangeSelectedRect.call(this);
      let props = {},
        count = 0;
      for (let i = minRowIndex; i <= maxRowIndex; i++) {
        for (let j = minCellIndex; j <= maxCellIndex; j++) {
          const vm = m[i][j];
          if (!vm.isSpan) {
            props = vm.props || {};
            count++;
          }
        }
      }
      this.contextMenuHandler(e);
      let rightclickInfo = {
        position: {
          x: e.clientX,
          y: e.clientY,
        },
        menulists: [
          {
            fnName: "mergeCellsHanlder",
            btnName: "合并单元格",
            handler: this.mergeCellsHanlder,
            disabled: count < 2,
          },
          {
            fnName: "splitCellHandler",
            btnName: "拆分单元格",
            disabled: getMergedCells.call(this).length <= 0,
            handler: this.splitCellHandler,
          },
          {
            divider: true,
          },
          {
            btnName: "插入行",
            params: {},
            submenu: [
              {
                fnName: "insertRowBefore",
                btnName: "向前插入",
                handler: this.insertRowBefore,
              },
              {
                fnName: "insertRowAfter",
                btnName: "向后插入",
                handler: this.insertRowAfter,
              },
            ],
          },
          {
            btnName: "插入列",
            params: {},
            submenu: [
              {
                fnName: "insertColumnBefore",
                btnName: "向前插入",
                handler: this.insertColumnBefore,
              },
              {
                fnName: "insertColumnAfter",
                btnName: "向后插入",
                handler: this.insertColumnAfter,
              },
            ],
          },
          {
            divider: true,
          },
          {
            btnName: "删除",
            params: {},
            submenu: [
              {
                fnName: "deleteRows",
                btnName: "删除整行",
                handler: this.deleteRows,
              },
              {
                fnName: "deleteColumns",
                btnName: "删除整列",
                handler: this.deleteColumns,
              },
            ],
          },
          {
            divider: true,
          },
          {
            fnName: "resetColWidth",
            btnName: "重置列宽",
            handler: this.resetColWidth,
          },
          {
            fnName: "resetRowHeight",
            btnName: "重置行高",
            handler: this.resetRowHeight,
          },
          {
            divider: true,
          },
          {
            fnName: "setTableCell",
            btnName: "单元格设置",
            handler: this.setTableCell,
          },
          {
            fnName: "clearChooseCell",
            btnName: "清除选中格式",
            handler: this.clearChooseCell,
          },
          {
            fnName: "clearAllCell",
            btnName: "清除所有格式",
            handler: this.clearAllCell,
          },
        ],
      };
      IDM.develop.openContextMenu(rightclickInfo);
    },

    updateRangeWrap() {
      updateRangeWrap.call(this, this.rangeWrap.selected);
    },
    getRows() {
      return this.propData.tableRows;
    },
    getCells(row) {
      return row.cols;
    },
    getCellWidth(cell, index) {
      let width;
      if (cell) {
        if (cell.colspan === 1) {
          width = this.propData.columnsList[index].width;
        }
      } else {
        width = this.propData.columnsList[index].width;
      }
      return width || "auto";
    },
    isSelected(rindex, cindex) {
      let result = _.find(this.rangeWrap.selected, (c) => {
        return rindex === c.rowIndex && cindex === c.cellIndex;
      });
      return result ? true : false;
    },
    // 列宽被改变
    onChangeCol(colList) {
      // console.log("🚀 ~ onChangeCol ~ colList:", colList);

      //这里需要改变属性
      this.propData.columnsList = colList;
      this.propDataChangeSync();
      // this.$emit("update:columnsInfo", colList);
    },
    // 行高被改变
    onChangeRow(index, height) {
      this.rows[index].height = height;
      this.propDataChangeSync();
    },

    //右键菜单处理
    contextMenuHandler(evt) {
      let target = evt.target;
      target = $(evt.target).closest("TD");
      target = filterSelfCell.call(this, target);
      if (target && target.length && target.get(0).tagName === "TD") {
        target = $(target);
        let pos = target.attr("c-index").split(",");
        let rowIndex = Number(pos[0]);
        let cellIndex = Number(pos[1]);
        //如果右键的单元格不再已经框选的范围内则重新以右键的单元格为当前选中单元格
        let result = _.findIndex(this.rangeWrap.selected, (c) => {
          return c.rowIndex === rowIndex && c.cellIndex === cellIndex;
        });
        if (result < 0) {
          this.downCell = target;
          this.rangeWrap.show = true;
          let cells = getRangeSelectedCells.call(this, this.downCell, null);
          updateRangeWrap.call(this, cells);
        }
      }
    },
    //清空右键菜单弹出过的痕迹
    clearContextMemuHandler() {
      this.isDown = false;
      clearRangeWrap.call(this);
    },
    //设计器全局的mousedown事件，设计器会向下级所有组件触发,可用于清理当前触发过mousedown事件留下的痕迹
    pageMouseDownHandle(e) {
      this.isDown = false;
      clearRangeWrap.call(this);
    },
    //鼠标down事件处理
    mouseDownHandler(evt) {
      if (this.isDesign && evt.button === 0) {
        this.isDown = true;
        this.downCell = $(evt.target);
        this.rangeWrap.show = true;
        parseMatrix.call(this);
        let cells = getRangeSelectedCells.call(this, this.downCell, null);
        updateRangeWrap.call(this, cells);
        evt.stopPropagation();
      }
    },
    //鼠标移动事件处理
    mouseMoveHandler(evt) {
      if (this.isDown) {
        let overCell = $(evt.target).closest("TD");
        let target = null;
        do {
          target = filterSelfCell.call(this, overCell);
          if (!target) {
            overCell = overCell.parents("TD");
            if (overCell.length === 0) {
              return;
            }
          }
        } while (!target);
        if (overCell) {
          let cells = getRangeSelectedCells.call(this, this.downCell, overCell);
          updateRangeWrap.call(this, cells);
          evt.stopPropagation();
        }
      }
    },
    //鼠标up事件处理
    mouseUpHandler() {
      this.isDown = false;
      parseMatrix.call(this);
    },
    //合并单元格
    mergeCellsHanlder() {
      let cells = this.rangeWrap.selected;
      console.log("🚀 ~ mergeCellsHanlder ~ cells:", cells);
      let range = getRangeSelectedRect.call(this);
      let r = cells[0].rowIndex;
      let c = cells[0].cellIndex;
      let rows = this.getCells(this.rows[r]);
      let cell = _.find(rows, (ce) => ce.cellIndex === c);
      mergeCells.call(
        this,
        cell,
        range.maxRowIndex - range.minRowIndex + 1,
        range.maxCellIndex - range.minCellIndex + 1
      );
      this.propDataChangeSync();
    },
    //拆分单元格
    splitCellHandler() {
      let cells = getMergedCells.call(this);
      splitCell.call(this, cells);
      this.propDataChangeSync();
    },
    //插入行（前）
    insertRowBefore() {
      parseMatrix.call(this);
      let _temp = [];
      let range = getRangeSelectedRect.call(this);
      let currIndex = range.minRowIndex;
      let insertRow = this.matrix[currIndex];
      let row = createRow();
      for (let i = 0; i < insertRow.length; i++) {
        let cell = insertRow[i];
        if (cell.isSpan) {
          cell = this.matrix[cell.rowIndex][cell.cellIndex];
        }
        if (cell.rowspan > 1 && currIndex > cell.rowIndex) {
          IDM.array.ensure(_temp, cell);
          continue;
        }
        let newCell = createCell();
        row.cols.push(newCell);
      }
      _.each(_temp, (cell) => {
        cell.rowspan++;
      });
      this.rows.splice(currIndex, 0, row);
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    //插入行（后）
    insertRowAfter() {
      parseMatrix.call(this);
      let _temp = [];
      let range = getRangeSelectedRect.call(this);
      let currIndex = range.maxRowIndex;
      let insertRow = this.matrix[currIndex];
      let row = createRow();
      for (let i = 0; i < insertRow.length; i++) {
        let cell = insertRow[i];
        if (cell.isSpan) {
          cell = this.matrix[cell.rowIndex][cell.cellIndex];
        }
        if (cell.rowspan > 1 && currIndex < cell.rowIndex + cell.rowspan - 1) {
          IDM.array.ensure(_temp, cell);
          continue;
        }
        let newCell = createCell();
        row.cols.push(newCell);
      }
      _.each(_temp, (cell) => {
        cell.rowspan++;
      });
      this.rows.splice(currIndex + 1, 0, row);
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    //插入列（前）
    insertColumnBefore() {
      parseMatrix.call(this);
      let _temp = [];
      let range = getRangeSelectedRect.call(this);
      let currIndex = range.minCellIndex;
      for (let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        let mrow = this.matrix[i];
        let cell = mrow[currIndex];
        if (cell.isSpan) {
          cell = this.matrix[cell.rowIndex][cell.cellIndex];
        }
        if (cell.colspan > 1 && currIndex > cell.cellIndex) {
          IDM.array.ensure(_temp, cell);
          continue;
        }
        let newCell = createCell();
        row.cols.splice(currIndex, 0, newCell);
      }
      _.each(_temp, (cell) => {
        cell.colspan++;
      });
      addColumn.call(this, currIndex);
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    //插入列（后）
    insertColumnAfter() {
      parseMatrix.call(this);
      let _temp = [];
      let range = getRangeSelectedRect.call(this);
      let currIndex = range.minCellIndex;
      for (let i = 0; i < this.rows.length; i++) {
        let row = this.rows[i];
        let mrow = this.matrix[i];
        let cell = mrow[currIndex];
        if (cell.isSpan) {
          cell = this.matrix[cell.rowIndex][cell.cellIndex];
        }
        if (cell.colspan > 1 && currIndex < cell.cellIndex + cell.colspan - 1) {
          IDM.array.ensure(_temp, cell);
          continue;
        }
        let newCell = createCell();
        row.cols.splice(currIndex + 1, 0, newCell);
      }
      _.each(_temp, (cell) => {
        cell.colspan++;
      });
      addColumn.call(this, currIndex + 1);
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    //删除行
    deleteRows() {
      parseMatrix.call(this);
      let range = getRangeSelectedRect.call(this);
      // let currIndex = range.minRowIndex;
      for (let i = range.maxRowIndex; i >= range.minRowIndex; i--) {
        const row = this.matrix[i];
        let n = row.length - 1;
        while (n >= 0) {
          let cell = row[n];
          if (cell.isSpan) {
            cell = this.matrix[cell.rowIndex][cell.cellIndex];
          }
          if (cell.rowspan > 1) {
            if (i > cell.rowIndex) {
              cell.rowspan--;
              n -= cell.colspan;
            } else {
              //补齐单元格
              if (cell.rowIndex === i && cell.cellIndex === n) {
                let newCell = createCell();
                newCell.rowspan = cell.rowspan - 1 > 1 ? cell.rowspan - 1 : 1;
                newCell.colspan = cell.colspan;
                let pos = _.findIndex(this.rows[i + 1].cols, (c) => {
                  return c.cellIndex > cell.cellIndex;
                });
                if (pos >= 0) {
                  this.rows[i + 1].cols.splice(pos, 0, newCell);
                } else {
                  this.rows[i + 1].cols.push(newCell);
                }
              }
              n--;
            }
          } else {
            n--;
          }
        }
        this.rows.splice(i, 1);
      }
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    //删除列
    deleteColumns() {
      parseMatrix.call(this);
      let range = getRangeSelectedRect.call(this);
      for (let n = range.maxCellIndex; n >= range.minCellIndex; n--) {
        let i = this.matrix.length - 1;
        while (i >= 0) {
          let row = this.matrix[i];
          let cells = this.rows[i].cols;
          let cell = row[n];
          if (cell.isSpan) {
            cell = this.matrix[cell.rowIndex][cell.cellIndex];
          }
          if (cell.colspan > 1) {
            if (n > cell.cellIndex) {
              cell.colspan--;
              i -= cell.rowspan;
            } else {
              //删除了colspan>1的列，需要在填补一个空位
              if (cell.rowIndex === i && cell.cellIndex === n) {
                let newCell = createCell();
                newCell.colspan = cell.colspan - 1 > 1 ? cell.colspan - 1 : 1;
                newCell.rowspan = cell.rowspan;
                let index = _.findIndex(cells, (cc) => cc === cell);
                cells.splice(index, 1, newCell);
              }
              i--;
            }
          } else {
            if (i === cell.rowIndex) {
              IDM.array.remove(cells, cell);
            }
            i--;
          }
        }
        removeColumn.call(this, n);
      }
      parseMatrix.call(this);
      this.propDataChangeSync();
    },
    // 重置列宽
    resetColWidth() {
      const newWidth = (100 / this.propData.columnsList.length).toFixed(3) + "%";
      this.onChangeCol(
        this.propData.columnsList.map((item) => {
          return { width: newWidth, colGuid: item.colGuid };
        })
      );
      this.propDataChangeSync();
    },
    // 重置行高
    resetRowHeight() {
      this.rows.forEach((vm) => {
        vm.height = "52px";
      });
      this.propDataChangeSync();
    },
    // 清除选中单元格格式
    clearChooseCell() {
      let m = parseMatrix.call(this);
      let {
        maxRowIndex,
        minRowIndex,
        maxCellIndex,
        minCellIndex,
      } = getRangeSelectedRect.call(this);
      for (let i = minRowIndex; i <= maxRowIndex; i++) {
        for (let j = minCellIndex; j <= maxCellIndex; j++) {
          const vm = m[i][j];
          if (!vm.isSpan) {
            vm.cellAttr = {
              align: "",
              valign: "",
            };
            vm.cellStyle = {};
            vm.cellBorderStyle = {};
            vm.props = {};
          }
        }
      }
      this.propDataChangeSync();
    },
    // 清除所有单元格格式
    clearAllCell() {
      let m = parseMatrix.call(this);
      for (let i = 0; i < m.length; i++) {
        for (let j = 0; j < m[i].length; j++) {
          const vm = m[i][j];
          if (!vm.isSpan) {
            vm.cellAttr = {
              align: "",
              valign: "",
            };
            vm.cellStyle = {};
            vm.cellBorderStyle = {};
            vm.props = {};
          }
        }
      }
      this.propDataChangeSync();
    },
    //单元格设置，需要调用框架内的设置
    setTableCell() {
      let m = parseMatrix.call(this);
      let {
        maxRowIndex,
        minRowIndex,
        maxCellIndex,
        minCellIndex,
      } = getRangeSelectedRect.call(this);
      let props = {},
        count = 0;
      for (let i = minRowIndex; i <= maxRowIndex; i++) {
        for (let j = minCellIndex; j <= maxCellIndex; j++) {
          const vm = m[i][j];
          if (!vm.isSpan) {
            props = vm.props || {};
            count++;
          }
        }
      }
      IDM.env_dev
        ? IDM.develop?.customAttrOpen(
            {
              title: "单元格属性",
              ok: (props) => {
                console.log("🚀 ~ setTableCell ~ props(ok):", props);
                for (let i = minRowIndex; i <= maxRowIndex; i++) {
                  for (let j = minCellIndex; j <= maxCellIndex; j++) {
                    const vm = m[i][j];
                    if (!vm.isSpan) {
                      vm.props = props;
                    }
                  }
                }
                setTableCellStyle.call(this, props);
                this.propDataChangeSync();
              },
              close: (props) => {
                // console.log("🚀 ~ setTableCell ~ props(close):", props)
              },
            },
            this.moduleObject,
            "innerAttr",
            //需要查找是单个选中还是多个选中,多个选中不回传，单个选中回传
            count == 1 ? props : {}
          )
        : alert("只支持在IDM环境下");
    },
  },
};

function addRow() {
  let row = createRow();
  console.log("🚀 ~ addRow ~ row:", row);
  this.propData.tableRows.push(row);
  return row;
}
function addCell(row) {
  let cell = createCell();
  row.cols.push(cell);
  return cell;
}
function addColumn(index) {
  if (IDM.isUnDef(index) || index < 0) {
    this.propData.columnsList.push({ width: "", colGuid: IDM.uuid() });
  } else {
    this.propData.columnsList.splice(index, 0, { width: "", colGuid: IDM.uuid() });
  }
}
function removeColumn(index) {
  IDM.array.removeAt(this.propData.columnsList, index);
}

//获取被框选的单元格
function getRangeSelectedCells(start, end) {
  let selected = [];
  if (end && start.get(0) != end.get(0)) {
    if (!start.attr("c-index") || !end.attr("c-index")) {
      return;
    }
    let pos_s = start.attr("c-index").split(",");
    let ri_s = Number(pos_s[0]);
    let ci_s = Number(pos_s[1]);
    let pos_e = end.attr("c-index").split(",");
    let ri_e = Number(pos_e[0]);
    let ci_e = Number(pos_e[1]);
    let min_c = Math.min(ci_s, ci_e);
    let max_c = Math.max(ci_s, ci_e);
    let min_r = Math.min(ri_s, ri_e);
    let max_r = Math.max(ri_s, ri_e);
    let _selected = [];
    //进行第一遍过滤，得出选中的单元格索引，因为有合并单元格的情况，第一遍并不完整
    for (let i = min_r; i <= max_r; i++) {
      let rowIndex = i;
      for (let n = min_c; n <= max_c; n++) {
        let cellIndex = n;
        let cell = this.matrix[rowIndex][cellIndex]; // getCellByIndex.call(this, rowIndex, cellIndex);
        // cell = { 'rowIndex': cell.rowIndex, 'cellIndex': cell.cellIndex }
        if (cell) {
          _selected.push(cell);
        }
      }
    }
    min_c = 99999;
    max_c = 0;
    min_r = 99999;
    max_r = 0;
    //进行第二遍过滤
    for (let i = 0; i < _selected.length; i++) {
      let rowIndex = _selected[i].rowIndex;
      let cellIndex = _selected[i].cellIndex;
      let cell = this.matrix[rowIndex][cellIndex];
      if (cell.isSpan) {
        cell = this.matrix[cell.rowIndex][cell.cellIndex];
      }
      min_r = Math.min(min_r, cell.rowIndex);
      max_r = Math.max(max_r, cell.rowIndex + cell.rowspan - 1);
      min_c = Math.min(min_c, cell.cellIndex);
      max_c = Math.max(max_c, cell.cellIndex + cell.colspan - 1);
    }
    for (let i = min_r; i <= max_r; i++) {
      let rowIndex = i;
      for (let n = min_c; n <= max_c; n++) {
        let cellIndex = n;
        let cell = this.matrix[rowIndex][cellIndex];
        if (cell.isSpan) {
          cell = this.matrix[cell.rowIndex][cell.cellIndex];
        }
        if (cell) {
          IDM.array.ensure(selected, cell);
        }
      }
    }
  } else {
    if (!start.attr("c-index")) {
      return;
    }
    let pos_s = start.attr("c-index").split(",");
    let rowIndex = Number(pos_s[0]);
    let cellIndex = Number(pos_s[1]);
    let cell = getCellByIndex.call(this, rowIndex, cellIndex);
    if (cell) {
      IDM.array.ensure(selected, cell);
    }
  }
  return selected;
}

/*获取框选矩形范围 */
function getRangeSelectedRect() {
  let cells = this.rangeWrap.selected;
  let sr = 9999,
    er = 0,
    sc = 9999,
    ec = 0;
  _.each(cells, (c) => {
    let y = c.rowIndex;
    let x = c.cellIndex;
    if (sr > y) {
      sr = y;
    }
    if (er < y + c.rowspan - 1) {
      er = y + c.rowspan - 1;
    }
    if (sc > x) {
      sc = x;
    }
    if (ec < x + c.colspan - 1) {
      ec = x + c.colspan - 1;
    }
  });
  return {
    maxRowIndex: er,
    minRowIndex: sr,
    maxCellIndex: ec,
    minCellIndex: sc,
  };
}

//创建列
function createCell() {
  return {
    colGuid: IDM.uuid(),
    width: "auto",
    rowspan: 1,
    colspan: 1,
    cellAttr: {
      align: "",
      valign: "",
    },
    cellStyle: {},
    cellBorderStyle: {},
  };
}
//创建行
function createRow() {
  return {
    rowGuid: IDM.uuid(),
    height: "52px",
    cols: [],
  };
}
//获取被合并的单元格
function getMergedCells() {
  let selected = this.rangeWrap.selected;
  let cells = [];
  for (let i = 0; i < selected.length; i++) {
    let c = selected[i];
    if (c.rowspan > 1 || c.colspan > 1) {
      cells.push(c);
    }
  }
  return cells;
}

//将表格转换为矩阵数组
function parseMatrix() {
  let matrix = []; //let offsetArray = [];
  let rows = this.getRows();
  if (rows && rows.length) {
    let allCells = {};
    _.each(rows, () => {
      matrix.push([]);
      // offsetArray.push(0);
    });
    for (let i = 0; i < rows.length; i++) {
      let row = rows[i];
      let cells = this.getCells(row);
      let offset_cell = 0;
      for (let n = 0; n < cells.length; n++) {
        let cell = cells[n];
        cell.rowIndex = i;
        cell.cellIndex = n;
        let rs = cell.rowspan || 1;
        let cs = cell.colspan || 1;
        while (matrix[i][offset_cell] !== undefined) {
          offset_cell++;
        }
        for (let r = i; r < i + rs; r++) {
          for (let c = offset_cell; c < offset_cell + cs; c++) {
            if (r === i && c === offset_cell) {
              matrix[r][c] = cell;
              cell.rowIndex = i;
              cell.cellIndex = c;
              allCells[cell.rowIndex + "," + cell.cellIndex] = cell;
            } else {
              matrix[r][c] = { isSpan: true, rowIndex: i, cellIndex: offset_cell };
            }
          }
        }
      }
    }
    this.allCells = allCells;
  }
  this.matrix = matrix;
  let columnLength = this.matrix[0] ? this.matrix[0].length : 0;
  _.eachRight(this.propData.columnsList, (c, i) => {
    if (i > columnLength - 1) {
      IDM.array.remove(c);
    }
  });
  return matrix;
}

//通过单元格获取索引
function getIndexByCellProp(prop) {
  for (let k in this.allCells) {
    if (this.allCells[k] === prop) {
      let pos = k.split(",");
      return {
        rowIndex: Number(pos[0]),
        cellIndex: Number(pos[1]),
      };
    }
  }
  return null;
}

//通过索引号获取单元格对象
function getCellByIndex(rowIndex, cellIndex) {
  return this.allCells[rowIndex + "," + cellIndex];
}

//通过矩阵数组更新表格数据
function updateRowsAndCells(m) {
  // let arr = [];
  for (let i = 0; i < m.length; i++) {
    let row = m[i];
    let arrs = [];
    for (let c = 0; c < row.length; c++) {
      let cell = row[c];
      if (cell && !cell.isSpan) {
        arrs.push(cell);
      }
    }
    this.rows[i].cols = arrs;
  }
  parseMatrix.call(this);
}

//更新选中区域
function updateRangeWrap(cells) {
  if (!this.isDesign) {
    return;
  }
  if (!cells) {
    return;
  }
  let top = Number.MAX_VALUE,
    left = Number.MAX_VALUE,
    right = Number.MIN_VALUE,
    bottom = Number.MIN_VALUE;
  for (let i = 0; i < cells.length; i++) {
    let rowIndex = cells[i].rowIndex;
    let cellIndex = cells[i].cellIndex;
    let cell = $(this.$refs.table).find(
      "td[c-index='" + rowIndex + "," + cellIndex + "']"
    );
    cell = filterSelfCell.call(this, cell);
    if (cell) {
      let cellOffset = cell.eq(0).position();
      let _top = cell.parent().position().top;
      let _left = cellOffset.left;
      top = Math.min(top, _top);
      left = Math.min(left, _left);
      right = Math.max(right, _left + cell.outerWidth());
      bottom = Math.max(bottom, _top + cell.outerHeight());
    }
  }
  let width = right - left;
  let height = bottom - top;

  this.rangeWrap.width = width;
  this.rangeWrap.height = height;
  this.rangeWrap.left = left;
  this.rangeWrap.top = top;
  this.rangeWrap.selected = cells;
}

//清空框选
function clearRangeWrap() {
  this.rangeWrap.show = false;
  this.rangeWrap.width = 0;
  this.rangeWrap.height = 0;
  this.rangeWrap.left = -10;
  this.rangeWrap.top = -10;
  this.rangeWrap.selected = [];
}

//过滤自身的td
function filterSelfCell(cells) {
  for (let i = 0; i < cells.length; i++) {
    let cell = cells.eq(i);
    let table = cell.closest("table");
    if (this.$refs.table === table.get(0)) {
      return cell;
    }
  }
  return null;
}

//合并单元格
function mergeCells(cell, rowSpan, cellSpan) {
  rowSpan = rowSpan || 1;
  cellSpan = cellSpan || 1;
  let pos = getIndexByCellProp.call(this, cell);
  let m = parseMatrix.call(this);
  for (let i = pos.rowIndex; i < pos.rowIndex + rowSpan; i++) {
    for (let n = pos.cellIndex; n < pos.cellIndex + cellSpan; n++) {
      if (i === pos.rowIndex && n === pos.cellIndex) {
        m[i].splice(n, 1, cell);
        cell.rowspan = rowSpan;
        cell.colspan = cellSpan;
      } else {
        m[i].splice(n, 1, {
          isSpan: true,
          rowIndex: cell.rowIndex,
          cellIndex: cell.cellIndex,
        });
      }
    }
  }
  updateRowsAndCells.call(this, m);
}

//拆分单元格
function splitCell(cells) {
  parseMatrix.call(this);
  _.each(cells, (c) => {
    for (let i = c.rowIndex; i < c.rowIndex + c.rowspan; i++) {
      for (let n = c.cellIndex; n < c.cellIndex + c.colspan; n++) {
        let cell = this.matrix[i][n];
        if (cell.isSpan) {
          this.matrix[i][n] = createCell();
        }
      }
    }
    c.rowspan = 1;
    c.colspan = 1;
  });
  updateRowsAndCells.call(this, this.matrix);
}

function setTableCellStyle(props) {
  /**
   * {
      "borderStyle": "solid",
      "borderWidth": 2,
      "borderColor": {
          "hsl": {
              "h": 0,
              "s": 0.909255898366606,
              "l": 0.5592,
              "a": 1
          },
          "hex": "#F52828",
          "hex8": "#F52828FF",
          "rgba": {
              "r": 245,
              "g": 40,
              "b": 40,
              "a": 1
          },
          "hsv": {
              "h": 0,
              "s": 0.8349999999999999,
              "v": 0.96,
              "a": 1
          },
          "oldHue": 0,
          "source": "hsva",
          "a": 1
      },
      "borderPosition": [
          "top",
          "hcenter",
          "bottom",
          "left",
          "vcenter",
          "right"
      ],
      "bgColor": {},
      "bgList",
      "font",
      "align": "center",
      "valign": "baseline",
      "clickFunction": [
          {
              "name": "IdmAutoGenFun_Fruz6eMcciPYtJAD",
              "param": {},
              "idmBuiltin": false,
              "customBuildCode": "(function (ctx) {});",
              "customSourceCode": "(ctx) => {\n\n}"
          }
      ]
  }
   */
  //{cellStyle, cellAttr, borderPosition}
  let cellStyle = {};
  props.font && IDM.style.setFontStyle(cellStyle, props.font);

  if (props.bgColor?.hex8) {
    cellStyle["background-color"] =
      IDM.hex8ToRgbaString(props.bgColor?.hex8) + "  !important";
  }
  if (Object.keys(props.bgList?.style || {}).length) {
    Object.assign(cellStyle, props.bgList.style);
  }
  props.box&&IDM.style.setBoxStyle(cellStyle, props.box);

  let cellAttr = {
    align: props?.align || "",
    valign: props?.valign || "",
  };

  const borderPosition = {
    t: {},
    l: {},
    r: {},
    b: {},
    cb: {},
    cr: {},
  };
  if (props?.borderStyle) {
    let style = "1px solid transparent";
    if (props.borderStyle !== "none") {
      style = `${props.borderWidth}px ${props.borderStyle} ${IDM.hex8ToRgbaString(
        props.borderColor?.hex8
      )}`;
    }
    if (props.borderPosition?.indexOf("top") > -1) {
      borderPosition.t["border-top"] = style;
    }
    if (props.borderPosition?.indexOf("hcenter") > -1) {
      borderPosition.cb["border-bottom"] = style;
    }
    if (props.borderPosition?.indexOf("bottom") > -1) {
      borderPosition.b["border-bottom"] = style;
    }
    if (props.borderPosition?.indexOf("left") > -1) {
      borderPosition.l["border-left"] = style;
    }
    if (props.borderPosition?.indexOf("vcenter") > -1) {
      borderPosition.cr["border-right"] = style;
    }
    if (props.borderPosition?.indexOf("right") > -1) {
      borderPosition.r["border-right"] = style;
    }
  }
  let m = parseMatrix.call(this);
  let {
    maxRowIndex,
    minRowIndex,
    maxCellIndex,
    minCellIndex,
  } = getRangeSelectedRect.call(this);
  // 处理选中区域中间单元格
  let border;
  for (let i = minRowIndex; i <= maxRowIndex; i++) {
    for (let j = minCellIndex; j <= maxCellIndex; j++) {
      const vm = m[i][j];
      if (!vm.isSpan) {
        vm.cellAttr = _.merge(vm.cellAttr, cellAttr);
        vm.cellStyle = _.merge(vm.cellStyle, cellStyle);
        // 处理选中区域上边界
        border = borderPosition.t["border-top"];
        if (i === minRowIndex && border) {
          vm.cellBorderStyle["border-top"] = border;
        }
        // 处理选中区域左边界
        border = borderPosition.l["border-left"];
        if (j === minCellIndex && border) {
          vm.cellBorderStyle["border-left"] = border;
        }
        // 处理选中区域右边界
        border = borderPosition.r["border-right"];
        if (j + vm.colspan - 1 === maxCellIndex && border) {
          vm.cellBorderStyle["border-right"] = border;
        }
        // 处理选中区域下边界
        border = borderPosition.b["border-bottom"];
        if (i + vm.rowspan - 1 === maxRowIndex && border) {
          vm.cellBorderStyle["border-bottom"] = border;
        }
        // 处理选中区域中间单元格
        border = borderPosition.cb["border-bottom"];
        if (border) {
          let w = parseInt(border.split(" ")[0]);
          let _w = parseInt(w / 2);
          if (i > minRowIndex) {
            vm.cellBorderStyle["border-top"] = border.replace(w + "px", _w + "px");
          }
          if (i + vm.rowspan - 1 < maxRowIndex) {
            if (_w < w / 2) {
              _w++;
            }
            vm.cellBorderStyle["border-bottom"] = border.replace(w + "px", _w + "px");
          }
        }
        border = borderPosition.cr["border-right"];
        if (border) {
          let w = parseInt(border.split(" ")[0]);
          let _w = parseInt(w / 2);
          if (j > minCellIndex) {
            vm.cellBorderStyle["border-left"] = border.replace(w + "px", _w + "px");
          }
          if (j + vm.colspan - 1 < maxCellIndex) {
            if (_w < w / 2) {
              _w++;
            }
            vm.cellBorderStyle["border-right"] = border.replace(w + "px", _w + "px");
          }
        }
      }
    }
  }
}
</script>
<style lang="scss">
//表格布局
.idm-table-layout.idm-dev-mode {
  & > .idm-table-layout-box {
    & > table > tbody > tr > td {
      min-height: 52px;
      .drag-proxy {
        width: 100%;
        height: 100%;
        min-height: 52px;
        position: absolute;
        top: 0;
        left: 0;
      }
    }
    //表格布局框选个单元格
    & > .selected-range {
      border: 4px solid #1890ff;
      position: absolute;
      left: -10px;
      top: -10px;
      z-index: 100;
      pointer-events: none;
    }
  }
  &.idm-no-border {
    & > .idm-table-layout-box {
      // border-top-style: dashed;
      // border-left-style: dashed;
      outline: 3px dashed #666;
      & > table > tbody > tr > td {
        border-right-style: dashed;
        border-bottom-style: dashed;
      }
    }
  }
  td.drag_container_empty {
    display: table-cell;
    outline: none;
    outline-offset: 0 !important;
    height: 52px !important;
  }
}

//表格布局
.idm-table-layout {
  &.idm-no-border {
    & > .idm-table-layout-box {
      border-top-style: none;
      border-left-style: none;
      & > table > tbody > tr > td {
        box-sizing: border-box;
        border-right-style: none;
        border-bottom-style: none;
        border-top-style: none;
        border-left-style: none;
        &:first-child {
          border-left-style: none;
        }
      }
      & > table > tbody > tr:first-child > td {
        border-top-style: none;
      }
    }
  }
  &.idm-no-left-border {
    & > .idm-table-layout-box {
      & > table > tbody > tr > td {
        &:first-child {
          border-left-width: 0px !important;
        }
      }
    }
  }
  &.idm-no-right-border {
    & > .idm-table-layout-box {
      & > table > tbody > tr > td {
        &:last-child {
          border-right-width: 0px !important;
        }
      }
    }
  }
  &.idm-no-top-border {
    & > .idm-table-layout-box {
      & > table > tbody > tr:first-child > td {
        border-top-width: 0px !important;
      }
    }
  }
  &.idm-no-bottom-border {
    & > .idm-table-layout-box {
      & > table > tbody > tr:last-child > td {
        border-bottom-width: 0px !important;
      }
    }
  }
  & > .idm-table-layout-box {
    position: relative;
    & > table {
      border-spacing: 0;
      width: 100%;
      & > thead > tr > th {
        padding: 0;
        border-style: none;
      }
      & > tbody > tr {
        > td {
          padding: 0;
          border: 1px solid #e6e6e6;
          border-top: 1px solid transparent;
          border-left: 1px solid transparent;
          box-sizing: border-box;
          unicode-bidi: bidi-override;
          position: relative;
          z-index: 1;
          * {
            unicode-bidi: inherit;
          }
          &:first-child {
            border-left: 1px solid #e6e6e6;
          }
        }
        &:first-child > td {
          border-top: 1px solid #e6e6e6;
        }
      }
    }
  }
  &.idm-table-fixed {
    & > .idm-table-layout-box {
      & > table {
        table-layout: fixed;
      }
    }
  }
  &.idm-table-border-style-none {
    & > .idm-table-layout-box {
      & > table {
        & > tbody > tr {
          > td {
            border-top-style: none;
            border-right-style: none;
            border-bottom-style: none;
            border-left-style: none;
          }
        }
      }
    }
  }
  &.idm-table-border-style-solid {
    & > .idm-table-layout-box {
      & > table {
        & > tbody > tr {
          > td {
            border-top-style: solid;
            border-right-style: solid;
            border-bottom-style: solid;
            border-left-style: solid;
          }
        }
      }
    }
  }
  &.idm-table-border-style-dashed {
    & > .idm-table-layout-box {
      & > table {
        & > tbody > tr {
          > td {
            border-top-style: dashed;
            border-right-style: dashed;
            border-bottom-style: dashed;
            border-left-style: dashed;
          }
        }
      }
    }
  }
}
</style>
