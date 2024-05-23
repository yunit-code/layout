<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    @click="containerClickHandle"
    idm-ctrl="drag_container"
    class="container-scrollbar-thumb"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
  >
      <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
      <slot :name="moduleObject.id"></slot>
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <!-- <div>v1.1.0{{$root.propData}}</div>
    <div class="drag_container" :idm-ctrl-id="moduleObject.id" idm-container-index="1">
      
    </div>
    <div class="drag_container" :idm-ctrl-id="moduleObject.id" idm-container-index="2">
      
    </div> -->
  </div>
</template>

<script>
export default {
  name: "Container",
  data() {
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr || {}
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
      this.convertAttrToStyleObject();
      console.log("组件内属性发生变化，变化后====》", this.propData);
    },
    /**
     * 把属性转换成样式对象
     */
    convertThemeListAttrToStyleObject() {
      const themeList = this.propData.themeList;
      if (!themeList || !themeList.length) {
        return;
      }
      const themeNamePrefix =
        IDM.setting &&
        IDM.setting.applications &&
        IDM.setting.applications.themeNamePrefix
          ? IDM.setting.applications.themeNamePrefix
          : "idm-theme-";
      for (var i = 0; i < themeList.length; i++) {
        var item = themeList[i];

        if (item.key != IDM.theme.getCurrentThemeInfo()) {
          //此处比对是不渲染输出不用的样式，如果页面会刷新就可以把此处放开
          continue;
        }
        let fontStyleObject = {
          color: item.mainColor ? item.mainColor.hex8 : "",
        };
        let backgroundObject = {
          "background-color": item.mainColor ? item.mainColor.hex8 + "  !important" : "",
        };
        if (item.bgList&&Object.keys(item.bgList.style).length) {
          Object.assign(backgroundObject, item.bgList.style);
        }

        if (this.propData.bgColorType == "1") {
          IDM.setStyleToPageHead(
            "." +
              themeNamePrefix +
              item.key +
              " #" +
              (this.moduleObject.id || "module_demo"),
            backgroundObject
          );
        }
      }
    },
    convertAttrToStyleObject() {
      var styleObject = {};
      const keyList = [
        "width",
        "height",
        "border",
        "box",
        "font",
        "boxShadow",
        "layout",
        "overflow",
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
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "boxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "layout":
              IDM.style.setLayoutStyle(styleObject, element);
              break;
            case "overflow":
              styleObject["overflow"] = element;
              break;
          }
        }
      }
      if (!this.propData.bgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, this.propData);
      } else if (Object.keys(this.propData.bgList.style).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }
      IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      this.convertThemeListAttrToStyleObject();
    },
    /**
     * 内部点击事件
     */
    containerClickHandle() {
      let that = this;
      if (this.moduleObject.env == "develop") {
        //开发模式下不执行此事件
        return;
      }
      //获取所有的URL参数、页面ID（pageId）、以及所有组件的返回值（用范围值去调用IDM提供的方法取出所有的组件值）
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      //自定义函数
      /**
       * [
       * {name:"",param:{}}
       * ]
       */
      var clickFunction = this.propData.clickFunction;
      clickFunction &&
        clickFunction.forEach((item) => {
          window[item.name] &&
            window[item.name].call(this, {
              urlData: urlObject,
              pageId,
              customParam: item.param,
              _this: this,
            });
        });
    },
  },
};
</script>

<style lang="scss">
.container-scrollbar-thumb {
  &::-webkit-scrollbar-track-piece {
    background-color: #ffffff;
  }

  &::-webkit-scrollbar {
    width: 8px;
    height: 9px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #ebebeb;
    background-clip: padding-box;
    min-height: 28px;
    border-radius: 4px;
  }
}
</style>
