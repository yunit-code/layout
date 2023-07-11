<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id">
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
    <div
      class="idm-md-modal"
      :class="`${
        dialogVisible || moduleObject.env == 'develop' ? 'idm-md-show' : ''
      } idm-${propData.animationKey || 'md-effect-1'}`"
    >
      <div class="idm-md-content">
        <button
          type="button"
          v-if="propData.closeDisplay"
          @click="cancelDialog"
          class="idm-md-close"
        >
          <span class="idm-md-close-x">
            <i class="idm-md-close-icon">
              <svg
                viewBox="64 64 896 896"
                data-icon="close"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
                class=""
              >
                <path
                  d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"
                ></path>
              </svg>
            </i>
          </span>
        </button>
        <div class="idm-md-header" v-if="propData.labelDisplay">
          {{ getDialogTitle() }}
        </div>
        <div class="idm-md-body">
          <div
            class="drag_container"
            :idm-ctrl-id="moduleObject.id"
            idm-container-index="1"
          ></div>
        </div>
        <div class="idm-md-footer" v-if="propData.footerDisplay">
          <a-button
            @click="cancelDialog"
            v-if="
              propData.footerButtonDisplay == 'all' ||
              propData.footerButtonDisplay == 'cancel'
            "
            :type="propData.cancelType || 'default'"
            :size="'default'"
          >
            {{ propData.cancelText || "取消" }}
          </a-button>
          <a-button
            @click="commitData"
            :loading="okLoading"
            v-if="
              propData.footerButtonDisplay == 'all' ||
              propData.footerButtonDisplay == 'ok'
            "
            :type="propData.okType || 'primary'"
            :size="'default'"
          >
            {{ propData.okText || "确认" }}
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IDialog",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      dialogVisible: false,
      okLoading: false,
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.convertAttrToStyleObject();
  },
  mounted() {
    //赋值给window提供跨页面调用
    this.$nextTick(function (params) {
      window[this.moduleObject.packageid] = this;
    });
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
     * 把属性转换成窗口背景样式对象
     */
    convertAttrToDialogOutStyleObject() {
      var styleObject = {};
      const keyList = [
        "width",
        "height",
        "minWidth",
        "maxWidth",
        "minHeight",
        "maxHeight",
        "border",
        "box",
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
            case "minWidth":
              styleObject["min-width"] = element;
              break;
            case "maxWidth":
              styleObject["max-width"] = element;
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
          }
        }
      }
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(this.moduleObject.id + " .idm-md-content", styleObject);
    },
    /**
     * 把属性转换成窗口背景样式对象
     */
    convertAttrToDialogBgStyleObject() {
      var styleObject = {},
        styleObject1 = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "bodyBgColor":
              if (element && element.hex8) {
                styleObject1["background-color"] = element.hex8;
              }
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
            case "dialogShadeColorCode":
              //窗口阴影颜色
              if (this.propData.animationKey != "md-effect-12") {
                styleObject["box-shadow"] = element;
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
      if (this.propData.bodyMaxWidth && this.propData.bodyMaxWidth != "auto") {
        styleObject1["max-width"] = this.propData.bodyMaxWidth;
        styleObject1["overflow-x"] = "auto";
      }
      if (this.propData.bodyMaxHeight && this.propData.bodyMaxHeight != "auto") {
        styleObject1["max-height"] = this.propData.bodyMaxHeight;
        styleObject1["overflow-y"] = "auto";
      }
      Object.keys(styleObject1).length > 0 &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + " .idm-md-content .idm-md-body,.idm-custom-dialog-class",
          styleObject1
        );
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(
          this.propData.animationKey == "md-effect-12"
            ? ".idm-empty-classname,.idm_dialog_wrap_preview .idm_dialog_shade_layer_" +
                this.moduleObject.packageid
            : this.moduleObject.id + " .idm-md-content,.idm-empty-classname",
          styleObject
        );
    },

    /**
     * 把属性转换成窗口标题样式对象
     */
    convertAttrToDialogTitleStyleObject() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "labelBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "splitLineSize":
              styleObject["border-bottom-width"] = element + "px";
              break;
            case "splitLineColor":
              if (element && element.hex8) {
                styleObject["border-bottom-color"] = element.hex8;
              }
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "border":
              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius + element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius + element.radius.rightTop.radiusUnit;
              break;
          }
        }
      }
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + " .idm-md-content .idm-md-header",
          styleObject
        );
    },

    /**
     * 把属性转换成关闭图标样式对象
     */
    convertAttrToDialogCloseStyleObject() {
      var styleObject = {};
      if (this.propData && this.propData.closeIconColor) {
        const element = this.propData.closeIconColor;
        if (!element && element !== false && element != 0) {
          return;
        }
        if (element && element.hex8) {
          styleObject["color"] = element.hex8;
          IDM.setStyleToPageHead(
            this.moduleObject.id + " .idm-md-content .idm-md-close",
            styleObject
          );
        }
      }
    },
    /**
     * 把属性转换成蒙层的样式对象
     */
    convertAttrToDialogShadeLayerStyleObject() {
      var styleObject = {};
      if (this.propData && this.propData.shadeLayerColor) {
        const element = this.propData.shadeLayerColor;
        if (!element && element !== false && element != 0) {
          return;
        }
        if (element && element.hex8) {
          styleObject["background"] = element.hex8;
        }
      }

      if (this.propData && this.propData.layerZindex) {
        const element = this.propData.layerZindex;
        if (!element && element !== false && element != 0) {
          return;
        }
        if (element) {
          //
          styleObject["z-index"] = parseInt(element) * 2 - 1;
          IDM.setStyleToPageHead(this.moduleObject.packageid + ",.idm-empty-classname", {
            "z-index": parseInt(element) * 2,
          });
        }
      }
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(
          ".idm_dialog_wrap_preview .idm_dialog_shade_layer_" +
            this.moduleObject.packageid,
          styleObject
        );
      //layerZindex
    },
    /**
     * 把属性转换成窗口底部样式对象
     */
    convertAttrToDialogFooterStyleObject() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "footerBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "splitLineSize":
              styleObject["border-top-width"] = element + "px";
              break;
            case "splitLineColor":
              if (element && element.hex8) {
                styleObject["border-top-color"] = element.hex8;
              }
              break;
            case "footerButtonPosition":
              styleObject["text-align"] = element;
              break;
            case "border":
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius + element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius + element.radius.rightBottom.radiusUnit;
              break;
          }
        }
      }
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + " .idm-md-content .idm-md-footer",
          styleObject
        );
    },
    /**
     * 把属性转换成窗口Body样式对象
     */
    convertAttrToDialogBodyStyleObject() {
      var styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "contentBox":
              IDM.style.setBoxStyle(styleObject, element);
              break;
          }
        }
      }
      Object.keys(styleObject).length > 0 &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + " .idm-md-content .idm-md-body",
          styleObject
        );
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      this.convertAttrToDialogOutStyleObject();
      this.convertAttrToDialogBgStyleObject();
      this.propData &&
        this.propData.labelDisplay &&
        this.convertAttrToDialogTitleStyleObject();
      this.propData &&
        this.propData.closeDisplay &&
        this.convertAttrToDialogCloseStyleObject();
      this.propData &&
        this.propData.footerDisplay &&
        this.convertAttrToDialogFooterStyleObject();
      this.convertAttrToDialogBodyStyleObject();
      this.convertAttrToDialogShadeLayerStyleObject();
      //动态标题函数[labelTextFunction]

      //蒙层关闭【是否启用】[shadeClose]【要操作外层的dom】

      //窗口位置【中心[center]、上左[topLeft]、上中[topCenter]、上右[topRight]、中左[centerLeft]、中右[centerRight]、下左[bottomLeft]、下中[bottomCenter]、下右[bottomRight]】[openPosition]【要操作外层的dom】

      //蒙层颜色[shadeLayerColor]【要操作外层的dom】

      //确定动作【元数据模式[metadata]、自定义接口[commitIntelfaceUrl]、自定义函数[commitFunction]】[commitType]
      //汇总范围:pageModuleSelectDataMultiple
      //分组标识:formGroupKey
      //确定后自定义关闭函数:okRunLaterFunction
      //取消前的自定义函数:cancelFunction
    },
    /**
     * 获取窗口的标题
     */
    getDialogTitle() {
      let resultTitle = this.propData.labelText || "";
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      try {
        if (
          this.propData.labelTextFunction &&
          this.propData.labelTextFunction.length > 0
        ) {
          var labelTextFunction = this.propData.labelTextFunction;
          labelTextFunction.forEach((item) => {
            resultTitle =
              window[item.name] &&
              window[item.name].call(this, {
                urlData: urlObject,
                pageId,
                customParam: item.param,
                _this: this,
              });
          });
        }
      } catch (error) {
        resultTitle = "自定义标题函数出错";
      }
      return resultTitle;
    },
    /**
     * 提交数据，先根据提交类型再判断提交方式
     */
    commitData(e) {
      let that = this;
      if (this.moduleObject.env == "develop") {
        //开发模式下不执行此事件
        return;
      }
      that.okLoading = true;
      //获取所有的URL参数、页面ID（pageId）、以及所有组件的返回值（用范围值去调用IDM提供的方法取出所有的组件值）
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      /**
       * 组件范围选择返回的格式：
       * [
       *  {
       *  moduleId:packageid,
       *  moduleName:asName
       *  }
       * ]
       */
      let pageModuleSelectDataMultiple = this.propData.pageModuleSelectDataMultiple;
      //表单分组标识
      let formGroupKey = this.propData.formGroupKey;
      //所有返回结果
      let moduleAllData = window.IDM.broadcast.getModuleContextValue(
        pageModuleSelectDataMultiple,
        formGroupKey
      );
      if (moduleAllData.errorData.length > 0) {
        //有校验失败的，不提交
        that.okLoading = false;
        return;
      }
      //所有已经校验通过的返回结果,数组形式
      let moduleDataArray = moduleAllData.resultData;

      if (this.propData.commitType == "metadata") {
        //元数据模式
        //固定地址，这里最好取IDM设置的配置
        window.IDM.setting.api.saveFormsMetaDataUrl &&
          window.IDM.http
            .post(
              window.IDM.setting.api.saveFormsMetaDataUrl,
              {
                urlData: urlObject,
                pageId,
                moduleData: moduleDataArray,
              },
              {
                headers: this.propData.commitContentType
                  ? {
                      "Content-Type":
                        this.propData.commitContentType ||
                        "application/json;charset=UTF-8",
                    }
                  : {},
              }
            )
            .then((res) => {
              //调用后续自定义函数
              that.okRunLaterHandle(res);
            })
            .catch(function (error) {
              that.okLoading = false;
            });
      } else if (this.propData.commitType == "intelface") {
        //自定义接口
        var commitIntelfaceUrl = this.propData.commitIntelfaceUrl;
        commitIntelfaceUrl &&
          window.IDM.http
            .post(
              commitIntelfaceUrl,
              {
                urlData: urlObject,
                pageId,
                moduleData: moduleDataArray,
              },
              {
                headers: this.propData.commitContentType
                  ? {
                      "Content-Type":
                        this.propData.commitContentType ||
                        "application/json;charset=UTF-8",
                    }
                  : {},
              }
            )
            .then((res) => {
              //调用后续自定义函数
              that.okRunLaterHandle(res);
            })
            .catch(function (error) {
              that.okLoading = false;
            });
      } else if (this.propData.commitType == "customFun") {
        //自定义函数
        /**
         * [
         * {name:"",param:{}}
         * ]
         */
        var commitFunction = this.propData.commitFunction;
        commitFunction.forEach((item) => {
          window[item.name] &&
            window[item.name].call(this, {
              urlData: urlObject,
              pageId,
              moduleData: moduleDataArray,
              customParam: item.param,
              _this: this,
              callback: this.okRunLaterHandle,
            });
        });
      } else {
        that.okLoading = false;
      }
    },
    /**
     * 确定后执行的函数
     */
    okRunLaterHandle(res) {
      let that = this;
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      let isClose = true;
      if (
        this.propData.okRunLaterFunction &&
        this.propData.okRunLaterFunction.length > 0
      ) {
        var okRunLaterFunction = this.propData.okRunLaterFunction;
        okRunLaterFunction.forEach((item) => {
          isClose =
            window[item.name] &&
            window[item.name].call(this, {
              urlData: urlObject,
              pageId,
              customParam: item.param,
              _this: this,
              resData: res,
              close: function () {
                //执行窗口关闭
                that.closeMyDialog(true);
              },
            });
        });
      }
      if (isClose !== false) {
        //执行窗口关闭
        that.closeMyDialog(true);
      }
    },
    /**
     * 取消窗口的方法
     */
    cancelDialog(e) {
      let that = this;
      if (this.moduleObject.env == "develop") {
        //开发模式下不执行此事件
        return;
      }
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      let isClose = true;
      if (this.propData.cancelFunction && this.propData.cancelFunction.length > 0) {
        var cancelFunction = this.propData.cancelFunction;
        cancelFunction.forEach((item) => {
          isClose =
            window[item.name] &&
            window[item.name].call(this, {
              urlData: urlObject,
              pageId,
              customParam: item.param,
              _this: this,
              close: function () {
                //执行窗口关闭
                that.closeMyDialog();
              },
            });
        });
      }
      if (isClose !== false) {
        //执行窗口关闭
        that.closeMyDialog();
      }
    },
    /**
     * 调用IDM提供的内置关闭方法
     */
    closeMyDialog(isOk) {
      let that = this;
      that.okLoading = false;
      window.IdmBuiltin_CloseDialog({
        routerId: this.moduleObject.routerId,
        targetModule: [
          { moduleId: this.moduleObject.packageid, moduleName: this.moduleObject.asName },
        ],
        isOkEvent: isOk,
      });
    },
    openThisDialogHandle() {
      this.dialogVisible = true;
      if (
        this.propData.animationKey == "md-effect-19" ||
        this.propData.animationKey == "md-effect-18" ||
        this.propData.animationKey == "md-effect-17"
      ) {
        $("html").addClass("idm-md-perspective");
      }
      $(
        (this.moduleObject.routerId
          ? "#router_page_" + this.moduleObject.routerId + " "
          : "") + ".idm_page_root"
      ).addClass(this.propData.animationKey.replace("md-effect", "idm-md-container"));
      $(
        (this.moduleObject.routerId
          ? "#router_page_" + this.moduleObject.routerId + " "
          : "") +
          "#" +
          this.moduleObject.packageid
      ).addClass(this.propData.openPosition || "center");
      if (this.propData.lockScroll) {
        $("body")
          .addClass("idm-body-scroll-disabled")
          .attr(
            "idm-idialog-number",
            parseInt($("body").attr("idm-idialog-number") || 0) + 1
          );
      }
    },
    closeThisDialogHandle() {
      this.dialogVisible = false;
      $(
        (this.moduleObject.routerId
          ? "#router_page_" + this.moduleObject.routerId + " "
          : "") + ".idm_page_root"
      ).removeClass(this.propData.animationKey.replace("md-effect", "idm-md-container"));

      if (
        this.propData.animationKey == "md-effect-19" ||
        this.propData.animationKey == "md-effect-18" ||
        this.propData.animationKey == "md-effect-17"
      ) {
        $("html").removeClass("idm-md-perspective");
      }
      let that = this;
      setTimeout(() => {
        $(
          (this.moduleObject.routerId
            ? "#router_page_" + this.moduleObject.routerId + " "
            : "") +
            "#" +
            that.moduleObject.packageid
        ).removeClass(that.propData.openPosition || "center");
      }, 400);

      if (this.propData.lockScroll) {
        $("body").attr(
          "idm-idialog-number",
          parseInt($("body").attr("idm-idialog-number") || 0) - 1
        );
        if (parseInt($("body").attr("idm-idialog-number") || 0) <= 0) {
          $("body").removeClass("idm-body-scroll-disabled");
        }
      }
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
      if (object.type && object.type == "linkageOpenDialog") {
        this.openThisDialogHandle();
      } else if (object.type && object.type == "linkageCloseDialog") {
        this.closeThisDialogHandle();
      }
    },
  },
};
</script>
<style lang="scss">
@import "../style/formsCommon.scss";
</style>
