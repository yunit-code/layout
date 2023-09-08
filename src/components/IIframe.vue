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
    class="idm_iframe_box"
  >
    <!--
      组件内部容器
      增加class="drag_container" 必选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选
    -->
    <iframe
      ref="iframeBox"
      class="idm_iframe_basestyle"
      :src="iframeSrc"
      :name="propData.iframeName || propData.ctrlId"
    />
    <div
      v-if="moduleObject.env == 'develop'"
      style="
        position: absolute;
        top: 0px;
        left: 0px;
        right: 0px;
        bottom: 0px;
        z-index: 99;
      "
    ></div>
  </div>
</template>

<script>
export default {
  name: "IIframe",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      iframeSrc: null,
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.initAttrToModule();
  },
  mounted() {},
  destroyed() {},
  methods: {
    /**
     * 获取url地址
     */
    getIframeSrc() {
      let that = this;
      let result = that.propData.iframeSrc
        ? IDM.url.getWebPath(that.propData.iframeSrc)
        : "";
      var customHandle = that.propData.iframeSrcFunction;
      customHandle &&
        customHandle.forEach((item) => {
          result = IDM.url.getWebPath(
            window[item.name] &&
              window[item.name].call(this, {
                ...that.commonParam(),
                customParam: item.param,
                _this: that,
              })
          );
        });
      this.iframeSrc = result;

      switch (this.propData.dataSourceType) {
        case "fixed":
          break;
        case "customInterface":
          this.propData.customInterfaceUrl &&
            window.IDM.http
              .get(this.propData.customInterfaceUrl, params)
              .then((res) => {
                that.iframeSrc = IDM.url.getWebPath(
                  that.getExpressData("resultData", that.propData.dataFiled, res.data)
                );
              })
              .catch(function (error) {});
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
        case "customFunction":
          break;
        case "dataSource":
          this.getIframeSrcDataSource()
          break
      }
    },
    getIframeSrcDataSource() {
      const dataSource = this.propData.dataSource;
      IDM.datasource.request(dataSource[0]?.id, {
        moduleObject: this.moduleObject,
        param: {
          ...this.customParamsFormat()
        }
      }, (data) => {
        this.iframeSrc = IDM.url.getWebPath( this.getExpressData("resultData", this.propData.dataFiled, data) );
      })
    },
    customParamsFormat() {
      let params = {}
      if (
        this.propData.customParamsFunction &&
        this.propData.customParamsFunction[0] &&
        this.propData.customParamsFunction[0].name
      ) {
        params =
          window[this.propData.customParamsFunction[0].name] &&
          window[this.propData.customParamsFunction[0].name].call(this, {
            customParam: this.propData.customParamsFunction[0].param,
            moduleObject: this.moduleObject,
            urlObject: IDM.url.queryObject(),
            routerParams: this.moduleObject.routerId
              ? IDM.router.getParam(this.moduleObject.routerId)
              : {}
          });
      }
      return params;
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object
     */
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object);
      if (
        object &&
        object.type == "linkageResult" &&
        this.propData.dataSourceType === "receiveMessage"
      ) {
        //结果格式化
        if (
          this.propData.iframeSrcFunction &&
          this.propData.iframeSrcFunction.length > 0
        ) {
          //所有地址的url参数转换
          var params = this.commonParam();
          var resValue = "";
          try {
            resValue =
              window[this.propData.iframeSrcFunction[0].name] &&
              window[this.propData.iframeSrcFunction[0].name].call(this, {
                ...params,
                ...this.propData.iframeSrcFunction[0].param,
                moduleObject: this.moduleObject,
                receiveData: object.message,
              });
          } catch (error) {}
          this.iframeSrc = resValue;
        } else {
          this.iframeSrc = object.message;
        }
        // 发现url参数值变化  页面不会刷新的问题 $nextTick不好使 故加此代码
        setTimeout(() => {
          this.$refs.iframeBox.contentWindow.location.reload();
        }, 100);
      }
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object) {
      console.log(
        "iframe统一接口设置的值",
        object,
        this.propData.dataName,
        this.propData.dataFiled
      );
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        this.iframeSrc = IDM.url.getWebPath(
          this.getExpressData(
            this.propData.dataName,
            this.propData.dataFiled,
            object.data
          )
        );
        console.log("iframeSrc", this.iframeSrc);
      }
    },
    /**
     * 通用的获取表达式匹配后的结果
     */
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if (dataFiled) {
        var filedExp = dataFiled;
        filedExp = dataName + (filedExp.startsWiths("[") ? "" : ".") + filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if (this.propData.customFunction && this.propData.customFunction.length > 0) {
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue =
            window[this.propData.customFunction[0].name] &&
            window[this.propData.customFunction[0].name].call(this, {
              ...params,
              ...this.propData.customFunction[0].param,
              moduleObject: this.moduleObject,
              expressData: _defaultVal,
              interfaceData: resultData,
            });
        } catch (error) {}
        _defaultVal = resValue;
      }

      return _defaultVal;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.initAttrToModule();
      console.log("组件内属性发生变化，变化后====》", this.propData);
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      for (const key in this.propData) {
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
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
          }
        }
      }
      if (!this.propData.bgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, this.propData);
      } else if (Object.keys(this.propData.bgList.style).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }
      IDM.setStyleToPageHead(this.moduleObject.id + " iframe", styleObject);
    },
    /**
     * 加载基本属性
     */
    initBaseAttrToModule() {
      this.getIframeSrc();
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },
    /**
     * 加载属性到组件中
     */
    initAttrToModule() {
      this.convertAttrToStyleObject();
      this.initBaseAttrToModule();
    },
  },
};
</script>
<style lang="scss">
.idm_iframe_basestyle {
  border: none;
}
.idm_iframe_box {
  line-height: 0;
}
</style>
