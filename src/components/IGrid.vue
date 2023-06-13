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
    class="idm-columns-layout"
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
      class="drag_container"
      :class="`flex-${item}`"
      v-for="(item, index) in (propData.grid || '12:12').split(':')"
      :key="index"
      :style="getColStyle(item, index + 1)"
      idm-ctrl-inner
      :idm-ctrl-id="moduleObject.id"
      :idm-container-index="index + 1"
      :idm-refresh-container="`flex-${item}`"
    ></div>
  </div>
</template>

<script>
export default {
  name: "IGrid",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      innerAttr: this.$root.propData.innerAttr || [],
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.convertAttrToStyleObject();
  },
  mounted() {},
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
    /**
     * 获取格子的样式
     * {
    "containerIndex": "2",
    "dataAttr": {
        "width": "auto",
        "height": "auto",
        "bgColor": {},
        "border": {
            "border": {
                "top": {
                    "style": "dotted",
                    "width": 4,
                    "widthUnit": "px",
                    "colors": {}
                },
                "right": {
                    "style": "dotted",
                    "width": 4,
                    "widthUnit": "px",
                    "colors": {}
                },
                "bottom": {
                    "style": "dotted",
                    "width": 4,
                    "widthUnit": "px",
                    "colors": {}
                },
                "left": {
                    "style": "dotted",
                    "width": 4,
                    "widthUnit": "px",
                    "colors": {}
                }
            },
            "radius": {
                "leftTop": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "rightTop": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "leftBottom": {
                    "radius": 0,
                    "radiusUnit": "px"
                },
                "rightBottom": {
                    "radius": 0,
                    "radiusUnit": "px"
                }
            }
        },
        "box": {
            "marginTopVal": "0px",
            "marginRightVal": "0px",
            "marginBottomVal": "0px",
            "marginLeftVal": "0px",
            "paddingTopVal": "9px",
            "paddingRightVal": "6px",
            "paddingBottomVal": "0px",
            "paddingLeftVal": "4px"
        }
    }
}
     */
    getColStyle(item, index) {
      let styleObject = {};
      if (this.propData.widthRatioFixed) {
        styleObject["min-width"] = 0;
      }
      var colArray = (this.propData.grid || "12:12").split(":");
      if (
        this.propData.colPadding &&
        this.propData.colPadding.inputVal &&
        this.propData.colPadding.selectVal
      ) {
        if (index != 1) {
          styleObject["padding-left"] =
            this.propData.colPadding.inputVal + this.propData.colPadding.selectVal;
        }
        if (index != colArray.length) {
          styleObject["padding-right"] =
            this.propData.colPadding.inputVal + this.propData.colPadding.selectVal;
        }
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
      }
      return styleObject;
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      const keyList=["width","height","box","border","font","layout","boxShadow"];
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
          }
        }
      }
      IDM.style.setBackgroundStyle(styleObject, this.propData);
      IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      if (this.innerAttr && this.innerAttr.length > 0) {
        this.innerAttr.forEach((element) => {
          this.convertInnerAttrToStyleObject(element.dataAttr, element.containerIndex);
        });
      }
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
          }
        }
      }
      IDM.style.setBackgroundStyle(styleObject, propData);
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
