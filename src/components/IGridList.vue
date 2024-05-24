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
      class="idm-columns-layout" 
      v-for="(grid,gindex) in propData.gridList" :style="getRowStyle(grid,grid.gridGuid||gindex)" :key="grid.gridGuid||gindex">
      <div
        class="drag_container"
        :class="`flex-${item}`"
        v-for="(item, index) in (grid.grid || '12:12').split(':')"
        :key="(grid.gridGuid||gindex)+'_'+index"
        :style="getColStyle(grid,item, (grid.gridGuid||gindex)+'_'+index)"
        @click="gridClickHandle(item, (grid.gridGuid||gindex)+'_'+index)"
        idm-ctrl-inner
        :idm-ctrl-id="moduleObject.id"
        :idm-container-index="(grid.gridGuid||gindex)+'_'+index"
        :idm-refresh-container="`flex-${item}`"
      >
        <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
        <slot :name="moduleObject.id+((grid.gridGuid||gindex)+'_'+index)"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IGridList",
  data() {
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr || {},
      innerAttr: this._propData?.innerAttr||this.$root?.propData?.innerAttr || [],
    };
  },
  props: {
    _moduleObject: Object,
    _propData: Object
  },
  created() {
    this.moduleObject = this._moduleObject||this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.convertAttrToStyleObject();
    console.log("组件内的created事件")
  },
  mounted() {
    //直接使用组件此处的回调必须的
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
  },
  destroyed() {},
  methods: {
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.innerAttr = propData.innerAttr || [];
      this.convertAttrToStyleObject();
    },
    getRowStyle(row,index){
      let styleObject = {};
      if (
        row.colPadding &&
        row.colPadding.inputVal &&
        row.colPadding.selectVal
      ) {
          styleObject["gap"] =
          row.colPadding.inputVal + row.colPadding.selectVal;
      }
      return styleObject;
    },
    getColStyle(grid,item, index) {
      let styleObject = {};
      if (grid.widthRatioFixed) {
        styleObject["min-width"] = 0;
      }
      let colAttrObject = this.innerAttr.filter((item) => item.containerIndex == index);
      if (colAttrObject && colAttrObject.length > 0) {
        var boxAttr = colAttrObject[0].dataAttr.box;
        if (boxAttr && boxAttr.paddingLeftVal) {
          styleObject["padding-left"] = boxAttr.paddingLeftVal;
        }
        if (boxAttr && boxAttr.paddingRightVal) {
          styleObject["padding-right"] = boxAttr.paddingRightVal;
        }
        if(colAttrObject[0].dataAttr.clickFunction?.length){
          styleObject["cursor"] = "pointer";
        }
        if(colAttrObject[0].dataAttr.widthFixed&&colAttrObject[0].dataAttr.width&&colAttrObject[0].dataAttr.width!='auto'){
          styleObject["flex"]="none";
        }
        if(colAttrObject[0].dataAttr.scrollAuto){
          styleObject["overflow"]="auto";
        }
      }
      return styleObject;
    },
    gridClickHandle(item, index){
      
      let colAttrObject = this.innerAttr.filter((item) => item.containerIndex == index);
      if (colAttrObject && colAttrObject.length > 0) {
        if(colAttrObject[0].dataAttr.clickFunction?.length){
          IDM.invokeCustomFunctions.apply(this, [colAttrObject[0].dataAttr.clickFunction, {
            index,
            item,
          }]);
        }
      }
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      const keyList = [
        "width",
        "height",
        "box",
        "border",
        "font",
        "layout",
        "boxShadow",
        "bgColor",
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
            case "layout":
              IDM.style.setLayoutStyle(styleObject, element);
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
          }
        }
      }
      if (Object.keys(this.propData.bgList?.style||{}).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }
      if(this.propData.gridBdSize>0){
        IDM.setStyleToPageHead(this.moduleObject.id+">.idm-columns-layout>div", {
          "border":`${this.propData.gridBdSize}px solid ${this.propData.gridBdColor&&this.propData.gridBdColor.hex8?IDM.hex8ToRgbaString(this.propData.gridBdColor.hex8):"#000000"}`,
          "margin-right":`-${this.propData.gridBdSize}px`,
          "margin-bottom":`-${this.propData.gridBdSize}px`,
        });
        IDM.setStyleToPageHead(this.moduleObject.id+">.idm-columns-layout", {
          "overflow":"visible"
        });
        styleObject["padding-right"]=this.propData.gridBdSize+"px";
        styleObject["padding-bottom"]=this.propData.gridBdSize+"px";
      }else{
        IDM.setStyleToPageHead(this.moduleObject.id+">.idm-columns-layout>div", {
          "border":`none`,
        });
      }
      IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      if (this.innerAttr && this.innerAttr.length > 0) {
        this.innerAttr.forEach((element) => {
          this.convertInnerAttrToStyleObject(element.dataAttr, element.containerIndex);
        });
      }
      this.convertAttrToAllStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToAllStyleObject() {
      var styleObject = {};
      const keyList = [
        "allBox",
        "allLayout",
      ];
      let hasLayout = false;
      for (const iKey in keyList) {
        const key = keyList[iKey];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "allBox":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "allLayout":
              IDM.style.setLayoutStyle(styleObject, element);
              hasLayout = styleObject["display"]=="flex";
              break;
          }
        }
      }
      Object.keys(styleObject).length&&IDM.setStyleToPageHead(this.moduleObject.id+">.idm-columns-layout>div,.emptyclassname", styleObject);
      hasLayout&&IDM.setStyleToPageHead(this.moduleObject.id+">.idm-columns-layout>div>*", {
                  "min-width":"100%"
                });
    },
    /**
     * 把属性参数转换成内部容器样式对象
     */
    convertInnerAttrToStyleObject(propData, index) {
      var styleObject = {};
      for (const key in propData) {
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "minHeight":
              styleObject["min-height"] = element;
              break;
            case "maxHeight":
              styleObject["max-height"] = element;
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
            case "layout":
              IDM.style.setLayoutStyle(styleObject, element);
              //如果单个设置了，则对单个的min-width设置为auto
              IDM.setStyleToPageHead(
                this.moduleObject.id +
                  ` .drag_container[idm-ctrl-id="${this.moduleObject.id}"][idm-container-index="${index}"]>*`,
                {
                  "min-width":"auto"
                }
              );
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
          }
        }
      }
      if (Object.keys(propData.bgList?.style||{}).length) {
        Object.assign(styleObject, propData.bgList.style);
      }
      IDM.setStyleToPageHead(
        this.moduleObject.id +
          ` .drag_container[idm-ctrl-id="${this.moduleObject.id}"][idm-container-index="${index}"]`,
        styleObject
      );
    },
  },
};
</script>
<style lang="scss"></style>
