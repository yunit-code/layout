<template>
  <!--
      根目录规范(必须不能为空)：
      idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
      id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
      idm-ctrl-id：组件的id，这个必须不能为空
    -->
  <div
    idm-ctrl="idm_module"
    :style="getStyle('root')"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    v-show="componentVisibleStatus"
  >
    <!--
        组件内部容器
        增加class="drag_container" 代表内部可存放组件容器 必选
        增加idm-ctrl-inner 代表内部容器组件（可定义单独的属性，只支持定义一类的属性,一个组件内只包含一种） 可选
        idm-ctrl-id：组件的id，这个必须不能为空
        idm-container-index  组件的内部容器索引，不重复唯一且不变，必选，建议从1开始
      -->
    <div
      class="idm_loopcontainer_box"
      :class="`layout-${propData.labelLayout || 'horizontal'}`"
    >
      <div
        class="idm_loopcontainer_label_box"
        :style="getStyle('label')"
        v-if="propData.labelDisplay || propData.labelDisplay == undefined"
      >
        <span class="required" v-if="propData.required && propData.status != 'readonly'"
          >*
        </span>
        <span class="label-content">{{ IDM.env_dev ? propData.label : "明细" }}</span>
      </div>
      <div
        class="idm_module_inner_box"
        :style="getStyle('content')"
        :class="{ 'error-state': errorMessage }"
        v-show="moduleObject.env !== 'production' || isCompleteLoadData"
      >
        <add-new-button
          v-if="propData.newPosition == 'top' && componentEditStatus"
          :propData.sync="propData"
          :moduleObject.sync="moduleObject"
          @click="addComponentData"
        />
        <template v-if="propData.tempLayout == 'tile'">
          <div
            v-for="(item, index) in componentData"
            :style="getLoopContainerWidth(index, item)"
            :key="item[indexDataFiled]"
          >
            <div
              class="idm_lc_titlebox"
              v-if="propData.showTitleBox || propData.showOperateButtonList"
              :idm-ctrl-id="moduleObject.id"
            >
              <div
                class="idm_lc_title"
                v-if="propData.showTitleBox"
                :idm-ctrl-id="moduleObject.id"
              >
                <svg
                  class="idm_lc_svgicon"
                  v-if="propData.titleIcon && propData.titleIcon.length > 0"
                  aria-hidden="true"
                >
                  <use :xlink:href="`#${propData.titleIcon[0]}`"></use>
                </svg>
                <span v-html="getRowsTitle(index, item)"></span>
              </div>
              <operate-button-list
                :propData.sync="propData"
                :moduleObject.sync="moduleObject"
                :itemData="item"
                :itemIndex="index"
                :componentData.sync="componentData"
                :componentEditStatus.sync="componentEditStatus"
                @click="operateButtonClickHandle"
                v-if="propData.showOperateButtonList"
              />
            </div>
            <div
              class="drag_container"
              :style="getLoopContainerStyle(index, item)"
              :key="item[indexDataFiled]"
              @click.stop="loopContainerClickHandle(index, item)"
              idm-ctrl-inner
              :idm-ctrl-id="moduleObject.id"
              :idm-container-index="item[indexDataFiled]"
              v-show="!item.hideDragDom"
            >
                <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
                <slot :name="moduleObject.id+item[indexDataFiled]"></slot>
            </div>
          </div>
        </template>
        <!--表格模式-->
        <template v-else>
          <div
            :class="`table-field-layout-table table-field-theme-${propData.tableTheme}`"
            :idm-ctrl-id="moduleObject.id"
          >
            <div
              v-if="propData.showTableHeader"
              :idm-ctrl-id="moduleObject.id"
              class="table-field-table-head"
            >
              <div
                class="table-field-table-cell"
                v-if="propData.showTableNo"
                :idm-ctrl-id="moduleObject.id"
                :style="{
                  'text-align': 'center',
                  width:
                    propData.tableNoWidth &&
                    propData.tableNoWidth.inputVal &&
                    propData.tableNoWidth.selectVal
                      ? propData.tableNoWidth.inputVal + propData.tableNoWidth.selectVal
                      : '50px',
                }"
              >
                序号
              </div>
              <div
                v-for="(sitem, sindex) in propData.tableFiledList"
                :style="{
                  width:
                    sitem.width && sitem.width.inputVal && sitem.width.selectVal
                      ? sitem.width.inputVal + sitem.width.selectVal
                      : 'auto',
                }"
                :key="sindex"
                :idm-ctrl-id="moduleObject.id"
                class="table-field-table-cell"
              >
                {{ sitem.title }}
              </div>
              <div
                class="table-field-table-cell"
                v-if="propData.showOperateButtonList"
                :idm-ctrl-id="moduleObject.id"
                :style="{
                  width:
                    propData.tableOperateWidth &&
                    propData.tableOperateWidth.inputVal &&
                    propData.tableOperateWidth.selectVal
                      ? propData.tableOperateWidth.inputVal +
                        propData.tableOperateWidth.selectVal
                      : '160px',
                }"
              >
                操作
              </div>
            </div>
            <div
              v-for="(item, index) in componentData"
              :key="item[indexDataFiled]"
              class="table-field-table-row"
              :idm-ctrl-id="moduleObject.id"
              :style="!item.idmContainerFold ? {} : { height: '0px', overflow: 'hidden' }"
            >
              <div
                class="table-field-table-cell item-idx"
                :idm-ctrl-id="moduleObject.id"
                v-if="propData.showTableNo"
              >
                {{ index + 1 }}
              </div>
              <div
                class="table-field-table-cell drag_container"
                v-for="(sitem, sindex) in propData.tableFiledList"
                :style="{
                  width:
                    sitem.width && sitem.width.inputVal && sitem.width.selectVal
                      ? sitem.width.inputVal + sitem.width.selectVal
                      : 'auto',
                }"
                :key="sindex"
                idm-ctrl-inner
                :idm-ctrl-id="moduleObject.id"
                :idm-container-index="item[indexDataFiled] + '_' + sindex"
                :idm-refresh-container="`${item[indexDataFiled] + '_' + sindex}`"
              >
                <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
                <slot :name="moduleObject.id+item[indexDataFiled] + '_' + sindex"></slot>
              </div>
              <div
                class="table-field-table-cell"
                :idm-ctrl-id="moduleObject.id"
                v-if="propData.showOperateButtonList"
              >
                <operate-button-list
                  :propData.sync="propData"
                  :moduleObject.sync="moduleObject"
                  :itemData="item"
                  :itemIndex="index"
                  :componentData.sync="componentData"
                  :componentEditStatus.sync="componentEditStatus"
                  @click="operateButtonClickHandle"
                />
              </div>
            </div>
          </div>
        </template>

        <add-new-button
          v-if="propData.newPosition == 'bottom' && componentEditStatus"
          :propData.sync="propData"
          :moduleObject.sync="moduleObject"
          @click="addComponentData"
        />
      </div>
    </div>
    <div
      class="idm_loopcontainer_msgbox"
      :class="`layout-${propData.labelLayout || 'horizontal'}`"
      v-if="errorMessage"
    >
      <div
        class="idm_loopcontainer_label_box"
        :style="getStyle('label')"
        v-if="
          (propData.labelDisplay || propData.labelDisplay == undefined) &&
          (propData.labelLayout == 'horizontal' || propData.labelLayout == undefined)
        "
      ></div>
      <div class="idm_loopcontainer_error_info" :style="getStyle('content')">
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script>
import AddNewButton from "../commonComponents/AddNewButton.vue";
import OperateButtonList from "../commonComponents/OperateButtonList.vue";
import ILoopContainer from "../mixins/ILoopContainer";
export default {
  name: "ILoopContainer",
  mixins: [ILoopContainer],
  data() {
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr || {},
      innerAttr: this._propData?.innerAttr||this.$root?.propData?.innerAttr || [],
      componentData: [{ idmContainerId: "index0", idmContainerFold: false }],
      //控件读写状态，true代表可编辑状态、false代表只读
      componentEditStatus: false,
      //控件显隐状态，true代表可可见、false代表隐藏
      componentVisibleStatus: false,
      //索引字段
      indexDataFiled: "idmContainerId",
      //数据源是否处于错误状态
      isErrorStatus: false,
      //是否完成加载数据
      isCompleteLoadData: false,
      //错误消息
      errorMessage: "",
      // 其他组件传过来的参数
      conditionObject: {},
    };
  },
  components: {
    AddNewButton,
    OperateButtonList,
  },
  props: {
    _moduleObject: Object,
    _propData: Object
  },
  created() {
    this.moduleObject = this._moduleObject||this.$root.moduleObject;
    this.initFirstComponentData();
    this.convertAttrToStyleObject();
    if (this.propData.loadDataCreated) {
      this.initData();
    }
  },
  mounted() {
    //直接使用组件此处的回调必须的
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
  },
  destroyed() {},
  methods: {
    /**
     * 循环容器点击事件
     * @param {*} index
     * @param {*} itemObject
     */
    loopContainerClickHandle(index, itemObject) {
      if (
        this.propData.loopContainerClickFunction &&
        this.propData.loopContainerClickFunction.length
      ) {
        this.commonCustomEventFunHandle(this.propData, "loopContainerClickFunction", {
          index,
          itemObject,
        });
      }
    },
    /**
     * 获取循环容器的样式
     * @param {*} item
     */
    getLoopContainerStyle(index, itemObject) {
      let styleObject = !itemObject.idmContainerFold
        ? {}
        : { height: "0px", overflow: "hidden" };
      if (
        this.propData.loopContainerClickFunction &&
        this.propData.loopContainerClickFunction[0] &&
        this.propData.loopContainerClickFunction[0].name
      ) {
        styleObject["cursor"] = "pointer";
      }
      if (
        this.propData.loopBgColorCustomFunction &&
        this.propData.loopBgColorCustomFunction.length
      ) {
        const styleBgColor = this.commonCustomEventFunHandle(
          this.propData,
          "loopBgColorCustomFunction",
          {
            index,
            itemObject,
          }
        );
        if (styleBgColor) {
          styleObject["background-color"] = styleBgColor;
        }
      }
      if (
        this.propData.loopBgImgCustomFunction &&
        this.propData.loopBgImgCustomFunction.length
      ) {
        const styleBgImg = this.commonCustomEventFunHandle(
          this.propData,
          "loopBgImgCustomFunction",
          {
            index,
            itemObject,
          }
        );
        if (styleBgImg) {
          styleObject["background-image"] = `url(${IDM.url.getWebPath(styleBgImg)})`;
        }
      }
      if (
        this.propData.loopBdColorCustomFunction &&
        this.propData.loopBdColorCustomFunction.length
      ) {
        const styleBdColor = this.commonCustomEventFunHandle(
          this.propData,
          "loopBdColorCustomFunction",
          {
            index,
            itemObject,
          }
        );
        if (styleBdColor) {
          styleObject["border-color"] = styleBdColor;
        }
      }
      return styleObject;
    },
    /**
     * 获取循环容器的宽度
     * @param {*} index
     * @param {*} itemObject
     */
    getLoopContainerWidth(index, itemObject) {
      let styleWidth;
      if (
        this.propData.loopWidth &&
        this.propData.loopWidth.inputVal &&
        this.propData.loopWidth.selectVal
      ) {
        styleWidth = this.propData.loopWidth.inputVal + this.propData.loopWidth.selectVal;
        if (this.propData.loopWidth.selectVal === "auto") {
          styleWidth = "auto";
        }
      }
      if (
        this.propData.loopWidthCustomFunction &&
        this.propData.loopWidthCustomFunction.length
      ) {
        styleWidth = this.commonCustomEventFunHandle(
          this.propData,
          "loopWidthCustomFunction",
          {
            index,
            itemObject,
          }
        );
      }
      return styleWidth ? { width: styleWidth } : null;
    },
    /**
     * 加载首条数据
     */
    initFirstComponentData() {
      this.indexDataFiled = this.propData.indexDataFiled || "idmContainerId";
      this.componentData = [{ [this.indexDataFiled]: "index0", idmContainerFold: false }];
    },
    /**
     * 初始化控件的只读状态
     */
    initComponentStatus(
      linkMessageObject,
      customFunData,
      pageInterfaceData,
      dataSourceData
    ) {
      if (this.moduleObject.env == undefined || this.moduleObject.env == "develop") {
        this.componentEditStatus = true;
        this.componentVisibleStatus = true;
        return;
      }
      switch (this.propData.status) {
        case "default":
          this.componentEditStatus = true;
          break;
        case "readonly":
          this.componentEditStatus = false;
          break;
        case "custom":
          if (
            this.propData.statusCustomFunction &&
            this.propData.statusCustomFunction.length
          ) {
            let result = this.commonCustomEventFunHandle(
              this.propData,
              "statusCustomFunction",
              {
                linkMessageObject,
                customFunData,
                pageInterfaceData,
                dataSourceData,
              }
            );
            this.componentEditStatus = result === true;
          } else if (this.propData.statusExpression) {
            this.componentEditStatus = IDM.express.replace(
              "@[" + this.propData.statusExpression + "]",
              {
                linkMessageObject,
                customFunData,
                pageInterfaceData,
                dataSourceData,
              }
            );
          }
          break;
      }

      switch (this.propData.defaultStatus) {
        case "default":
          this.componentVisibleStatus = true;
          break;
        case "hidden":
          this.componentVisibleStatus = false;
          break;
        case "custom":
          if (
            this.propData.defaultStatusCustomFunction &&
            this.propData.defaultStatusCustomFunction.length
          ) {
            let result = IDM.invokeCustomFunctions.apply(this, [
              this.propData.defaultStatusCustomFunction,
              {
                linkMessageObject,
                customFunData,
                pageInterfaceData,
                dataSourceData,
              },
            ]);
            this.componentVisibleStatus =
              result && result.length > 0 && result[0] === true;
          } else if (this.propData.defaultStatusExpression) {
            this.componentVisibleStatus = IDM.getExpressData(
              this.propData.defaultStatusExpression,
              {
                linkMessageObject,
                customFunData,
                pageInterfaceData,
                dataSourceData,
              }
            );
          }
          break;
      }
    },
    /**
     * 加载真实的数据，等数据加载完后再重新从零开始加载，如果发现没有 indexDataFiled需要补充完整的
     */
    initData() {
      this.initComponentStatus();
      //需要增加设置是否默认至少保留一条且不能删除。如果不是则需要把 this.componentData 清空，然后显示空状态
      // this.propData.reserveOneData
      if(this.moduleObject.env=="develop"){
        return;
      }
      if (!this.propData.reserveOneData) {
        this.componentData = [];
      }
      let that = this;
      switch (this.propData.dataSourceType) {
        case "datasource":
          if (
            this.propData.dataSourceSelectData &&
            this.propData.dataSourceSelectData.length
          ) {
            IDM.datasource.request(
              this.propData.dataSourceSelectData[0].id,
              {
                moduleObject: this.moduleObject,
                param: {
                  ...this.conditionObject,
                  ...this.commonParam()
                },
              },
              function (resData) {
                //这里是请求成功的返回结果
                if (that.propData.customFunction && that.propData.customFunction.length) {
                  let resValue = that.commonCustomEventFunHandle(
                    that.propData,
                    "customFunction",
                    {
                      ResultData: resData,
                      moduleObject: that.moduleObject,
                    }
                  );
                  that.loadRealData(resValue);
                  that.initComponentStatus(null, resValue, null, resData);
                } else {
                  that.loadRealData(resData);
                  that.initComponentStatus(null, null, null, resData);
                }
              },
              function (error) {
                //这里是请求失败的返回结果
                that.isErrorStatus = true;
              }
            );
          }
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
        case "customFunction":
          let resValue = this.commonCustomEventFunHandle(
            this.propData,
            "customFunction",
            {
              moduleObject: this.moduleObject,
            }
          );
          this.loadRealData(resValue);
          this.initComponentStatus(null, resValue, null, null);

          break;
      }
    },
    /**
     * 加载真实数据
     * @param {*} resultDataParam
     */
    loadRealData(resultDataParam) {
      // 重新加载设置为false
      this.isCompleteLoadData = false;
      //处理循环字段
      let resultData = this.propData.forDataFiled
        ? IDM.express.replace("@[" + this.propData.forDataFiled + "]", resultDataParam)
        : resultDataParam;

      //移除之前的数据
      this.componentData.forEach((item, index) => {
        //移除
        this.moduleObject.removeDynamicRenderModuleGroup &&
          this.moduleObject.removeDynamicRenderModuleGroup(
            this.moduleObject.packageid,
            item[this.indexDataFiled],
            this.propData.tempLayout == "table"
          );
      });
      if (IDM.type(resultData) !== "array") {
        this.componentData = [];
        this.isCompleteLoadData = true;
        return;
      }
      const foldFlag = resultData.length > this.propData.autoFoldNumber;
      //检查数据是否包含 indexDataFiled 需要补充完整的
      resultData.forEach((item, index) => {
        if (!item[this.indexDataFiled]) {
          item[this.indexDataFiled] = "index" + (index === 0 ? 0 : IDM.uuid());
          item.idmContainerFold = foldFlag;
        }
      });
      if ( resultData && resultData.length ) {
        this.componentData = resultData;
      } else {
        this.componentData = [{ idmContainerId: "index0", idmContainerFold: false, hideDragDom: true }];
      }
      this.$nextTick(() => {
        this.componentData.forEach((item, index) => {
          this.moduleObject.dynamicRenderModuleGroupInitData &&
            this.moduleObject.dynamicRenderModuleGroupInitData(
              this.moduleObject.packageid,
              item[this.indexDataFiled],
              item,
              this.propData.tempLayout == "table",
              this.propData.sendMessageKey
            );
        });
        setTimeout(() => {
          this.isCompleteLoadData = true;
        }, this.propData.delayShowTime ?? 0);
      });
    },
    /**
     * 操作按钮公共点击处理函数
     * @param {*} itemData 当前的整条数据
     * @param {*} itemIndex 当前数据的索引
     * @param {*} configObject 当前操作的配置项
     * @param {*} configIndex 当前操作按钮的配置索引
     */
    operateButtonClickHandle(itemData, itemIndex, configObject, configIndex) {
      if (this.moduleObject.env == "develop") {
        return;
      }
      switch (configObject.buttonHandleType) {
        case "insert": //添加
          this.addComponentData(itemIndex);
          break;
        case "del": //删除
          this.removeComponentData(itemData, itemIndex);
          break;
        case "fold": //折叠
          this.componentData[itemIndex]["idmContainerFold"] = !this.componentData[
            itemIndex
          ]["idmContainerFold"];
          break;
        case "upsort": //上移
          if (itemIndex == 0) {
            return;
          }
          this.componentData[itemIndex - 1] = this.componentData.splice(
            itemIndex,
            1,
            this.componentData[itemIndex - 1]
          )[0];
          break;
        case "downsort": //下移
          if (this.componentData.length - 1 == itemIndex) {
            return;
          }
          this.componentData[itemIndex + 1] = this.componentData.splice(
            itemIndex,
            1,
            this.componentData[itemIndex + 1]
          )[0];
          break;
        case "custom": //自定义函数 clickCustomFunction
          if (
            configObject.clickCustomFunction &&
            configObject.clickCustomFunction.length
          ) {
            this.commonCustomEventFunHandle(configObject, "clickCustomFunction", {
              index: itemIndex,
              itemObject: itemData,
              configObject,
              configIndex,
            });
          }
          break;
      }
    },
    /**
     * 获取行的标题
     * @param {*} index
     */
    getRowsTitle(index, itemObject) {
      let title = this.propData.titleTitle + (index + 1);
      if (
        this.propData.titleTextShowCustomFunction &&
        this.propData.titleTextShowCustomFunction.length
      ) {
        title = this.commonCustomEventFunHandle(
          this.propData,
          "titleTextShowCustomFunction",
          {
            index,
            itemObject,
          }
        );
      }
      return title;
    },
    /**
     * 添加数据
     * @param {*} index 要追加的索引，如果大于0则需要执行插入
     */
    addComponentData(index) {
      if (this.moduleObject.env == "develop") {
        return;
      }
      let idmContainerId = "index" + IDM.uuid();
      let itemData = { [this.indexDataFiled]: idmContainerId, idmContainerFold: false };
      if (index > -1) {
        this.componentData.splice(index + 1, 0, itemData);
      } else {
        this.componentData.push(itemData);
      }
      this.$nextTick(() => {
        //这里需要调用框架内置处理渲染函数、发送对应的数据消息处理函数
        this.moduleObject.dynamicRenderModuleGroupInitData &&
          this.moduleObject.dynamicRenderModuleGroupInitData(
            this.moduleObject.packageid,
            idmContainerId,
            itemData,
            this.propData.tempLayout == "table",
            this.propData.sendMessageKey
          );
      });
      //该容器下的组件数据需要把结果值返回给componentData里面。
      this.errorMessage = "";
    },
    removeComponentData(item, index) {
      //删除的方法   removeDynamicRenderModuleGroup(packageid, idmContainerId)
      this.moduleObject.removeDynamicRenderModuleGroup &&
        this.moduleObject.removeDynamicRenderModuleGroup(
          this.moduleObject.packageid,
          item[this.indexDataFiled],
          this.propData.tempLayout == "table"
        );
      this.componentData.splice(index, 1);
      this.errorMessage = "";
    },
    /**
     * 格式化接收到的其他数据
     * @param {*} data
     */
    formatReceiveOtherData(receiveData, message, pageInterfaceData) {
      //结果格式化
      let resValue;
      if (this.propData.customFunction && this.propData.customFunction.length > 0) {
        //所有地址的url参数转换
        resValue = this.commonCustomEventFunHandle(this.propData, "customFunction", {
          moduleObject: this.moduleObject,
          receiveData: receiveData,
        });
        this.loadRealData(resValue);
      } else {
        this.loadRealData(receiveData);
      }
      this.$nextTick(() => {
        this.initComponentStatus(message, resValue, pageInterfaceData, null);
      });
    },
    showThisModuleHandle() {
      this.componentVisibleStatus = true;
    },
    hideThisModuleHandle() {
      this.componentVisibleStatus = false;
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
      console.log('循环组件收到消息',object)
      if (object && object.type == "linkageShowModule") {
        this.showThisModuleHandle();
      } else if (object && object.type == "linkageHideModule") {
        this.hideThisModuleHandle();
      } else if (object && object.type == 'linkageReload') {
        this.initData()
      } else if (
        object &&
        object.type == "linkageResult" &&
        this.propData.dataSourceType === "receiveMessage" &&
        (!this.propData.receiveMessageKey ||
          (this.propData.receiveMessageKey &&
            this.propData.receiveMessageKey.length == 0) ||
          (this.propData.receiveMessageKey &&
            IDM.type(this.propData.receiveMessageKey) == "array" &&
            this.propData.receiveMessageKey.indexOf(object.messageKey) > -1) ||
          (IDM.type(this.propData.receiveMessageKey) == "string" &&
            this.propData.receiveMessageKey == object.messageKey))
      ) {
        this.formatReceiveOtherData(object.message, object);
      }
      //转发消息，如果其他组件接收到了他的消息可以选择   获取此控件的值然后做整体合计、计算类的动作
      if (
        this.propData.linkageDemandPageModule &&
        this.propData.linkageDemandPageModule.length > 0 &&
        object.type == "linkageDemand"
      ) {
        var moduleIdArray = [];
        this.propData.linkageDemandPageModule.forEach((item) => {
          moduleIdArray.push(item.moduleId);
        });
        moduleIdArray.length && this.getChildrenContextToThis();
        this.sendBroadcastMessage({
          type: "linkageDemand",
          message: this.componentData,
          rangeModule: moduleIdArray,
          messageKey: object.messageKey,
          triggerType: object.triggerType,
        });
      }
      if (
        this.propData.linkageResultPageModule &&
        this.propData.linkageResultPageModule.length > 0 &&
        object.type == "linkageResult"
      ) {
        var moduleIdArray = [];
        this.propData.linkageResultPageModule.forEach((item) => {
          moduleIdArray.push(item.moduleId);
        });
        moduleIdArray.length && this.getChildrenContextToThis();
        this.sendBroadcastMessage({
          type: "linkageResult",
          message: this.componentData,
          rangeModule: moduleIdArray,
          messageKey: object.messageKey,
          triggerType: object.triggerType,
        });
      }
      if (this.propData.linkageParamList && this.propData.linkageParamList.length&&this.moduleObject.env=='production') {
        this.propData.linkageParamList.forEach((item) => {
          if (object.type == item.messageType) {
            if(item.customFunction&&item.customFunction.length) {
              var clickFunction = item.customFunction;
              clickFunction&&clickFunction.forEach(e=>{
                  window[e.name]&&window[e.name].call(this,{
                      customParam:e.param,
                      message: object.message,
                      _this:this,
                  });
              })
            } else {
              this.conditionObject[item.paramKey] = object.message
              this.initData()
            }
          }
        })
      }
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object
     */
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
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
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (
        object.key == this.propData.dataName &&
        this.propData.dataSourceType === "pageCommonInterface"
      ) {
        this.formatReceiveOtherData(object.data, null, object.data);
      }
    },
    /**
     * 交互功能：获取需要返回的值，返回格式如下
     * @return {
     *    type:"success",
     *    message:"type为失败的时候原因",
     *    key:"定义的key标识，一般组件定义了一个属性，然后获取指定属性填写的值，这样返回后就能识别对应的字段或者元数据",
     *    data:{要返回的值，内容为：字符串 or 数组 or 对象},
     * }
     */
    getContextValue() {
      let result = {
        type: "success",
        message: "",
        key: this.propData.formFiledKey || this.propData.ctrlId,
      };
      let verdata = this.verifyInputValue();
      if (!verdata.success) {
        result.type = "error";
        result.message = verdata.message;
        result.data = verdata.data;
        // this.$refs["iinput" + this.moduleObject.id].focus();
      } else {
        result.data = this.componentData;
      }
      return result;
    },
    /**
     * 获取子组件的内容到componentData并返回错误信息
     */
    getChildrenContextToThis() {
      let hasErrorData = [];
      this.componentData.forEach((item) => {
        const allModulePackageId = this.moduleObject?.getModuleChildrenPackageId(
          this.moduleObject.packageid,
          item[this.indexDataFiled],
          this.propData.tempLayout == "table"
        );
        //所有返回结果
        let moduleAllData = window.IDM.broadcast.getModuleContextValue(
          allModulePackageId,
          null
        );
        if (moduleAllData.errorData.length > 0) {
          //有校验失败的
          hasErrorData.push({ item, errorData: moduleAllData.errorData });
          return false;
        }
        //所有已经校验通过的返回结果,数组形式
        let moduleDataArray = moduleAllData.resultData;
        moduleDataArray &&
          moduleDataArray.forEach((mitem) => {
            if (mitem.key) {
              item[mitem.key] = mitem.data;
            }
          });
      });
      if (!hasErrorData.length) {
        this.errorMessage = "";
      }
      return hasErrorData;
    },
    /**
     * 校验内容是否通过，如果通过则返回true，未通过返回false
     * 文本框输入改变的时候触发，获取当前控件值的时候触发
     * 上面两种情况都会触发校验并且显示错误提示
     * @params type:"change为文本框改变的时候，return为控件返回值的时候"
     * @return {
     *   success:true或false  校验是否通过
     *   message:提示的消息
     * }
     */
    verifyInputValue(type) {
      let that = this;
      let result = {
        success: true,
        message: "",
      };
      if (this.propData.status == "readonly") {
        this.errorMessage = "";
        return result;
      }
      //这里去拉取所有子组件的数据
      let childrenErrorData = this.getChildrenContextToThis();
      if (childrenErrorData.length) {
        result.success = false;
        result.data = childrenErrorData;
        result.message = "内容校验未通过！";
        this.errorMessage = result.message;
        return result;
      }

      let thisInputVal = this.componentData;
      //这里开始判断执行是否需要校验
      if (this.propData.required && thisInputVal.length == 0) {
        //必填
        result.success = false;
        result.message = this.propData.requiredText || this.propData.label + "不能为空";
      } else if (
        this.propData.minLength &&
        thisInputVal.length < this.propData.minLengthNumber
      ) {
        result.success = false;
        result.message =
          this.propData.minLengthText ||
          this.propData.label + "最小条数为" + this.propData.minLengthNumber;
      } else if (
        this.propData.maxLength &&
        thisInputVal.length > this.propData.maxLengthNumber
      ) {
        result.success = false;
        result.message =
          this.propData.maxLengthText ||
          this.propData.label + "最小条数为" + this.propData.maxLengthNumber;
      } else if (this.propData.customFun && this.propData.customFunCode) {
        try {
          var fun = IDM.express.eval(this.propData.customFunCode);
          if (!fun(thisInputVal)) {
            result.success = false;
            result.message =
              this.propData.customFunText || this.propData.label + "格式错误";
          }
        } catch (e) {}
      } else if (this.propData.customFun && this.propData.customFunCode) {
        try {
          var fun = IDM.express.eval(this.propData.customFunCode);
          if (!fun(thisInputVal)) {
            result.success = false;
            result.message =
              this.propData.customFunText || this.propData.label + "格式错误";
          }
        } catch (e) {}
      }
      if (!result.success) {
        this.errorMessage = result.message;
      } else {
        this.errorMessage = "";
      }
      return result;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.innerAttr = propData.innerAttr || [];
      this.initFirstComponentData();
      this.convertAttrToStyleObject();
    },
    /**
     * 主题颜色
     */
    convertThemeListAttrToStyleObject() {
      var themeList = this.propData.themeList;
      if (!themeList) {
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
        //item.key：为主题样式的key
        //item.mainColor：主要颜色值
        //item.minorColor：次要颜色值
        if (item.key != IDM.theme.getCurrentThemeInfo()) {
          //此处比对是不渲染输出不用的样式，如果页面会刷新就可以把此处放开
          continue;
        }
        let cssObject_color_main = {
          color: item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : "",
        };
        let cssObject_border_main = {
          "border-color": item.mainColor ? IDM.hex8ToRgbaString(item.mainColor.hex8) : "",
        };
        let cssObject_background_main = {
          "background-color": item.mainColor
            ? IDM.hex8ToRgbaString(item.mainColor.hex8)
            : "",
        };
        let cssObject_border_minor = {
          "border-color": item.minorColor
            ? IDM.hex8ToRgbaString(item.minorColor.hex8)
            : "",
        };
        let cssObject_background_minor = {
          "background-color": item.minorColor
            ? IDM.hex8ToRgbaString(item.minorColor.hex8)
            : "",
        };
        const firstPrefix =
          "." +
          themeNamePrefix +
          item.key +
          " #" +
          (this.moduleObject.packageid || "module_demo");

        IDM.setStyleToPageHead(
          `${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary:focus,
          ${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary:hover,
          ${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary,
          ${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary.active,
          ${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary:active`,
          { ...cssObject_border_main, ...cssObject_background_main }
        );
        IDM.setStyleToPageHead(
          `${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary:focus,
          ${firstPrefix} .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"] .ant-btn-primary:hover`,
          { opacity: "0.8" }
        );
        IDM.setStyleToPageHead(
          `${firstPrefix} .idm_lc_titlebox[idm-ctrl-id="${this.moduleObject.id}"] .idm_lc_operate`,
          { ...cssObject_color_main }
        );
      }
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {},
        errorStyleObject = {},
        innerLayoutStyleObject = {};
      const keyList = [
        "width",
        "height",
        "border",
        "box",
        "font",
        "labelFont",
        "errorMsgFont",
        "errorBoxShadow",
        "errorBorder",
        "layout",
        "boxShadow",
        "bgColor"
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
            case "labelFont":
              let labelInfoStyleObject = {};
              IDM.style.setFontStyle(labelInfoStyleObject, element);
              IDM.setStyleToPageHead(
                this.moduleObject.id +
                  ">.idm_loopcontainer_box>.idm_loopcontainer_label_box>.label-content",
                labelInfoStyleObject
              );
              break;
            case "errorMsgFont":
              let errorInfoStyleObject = {};
              IDM.style.setFontStyle(errorInfoStyleObject, element);
              IDM.setStyleToPageHead(
                this.moduleObject.id +
                  ">.idm_loopcontainer_msgbox>.idm_loopcontainer_error_info",
                errorInfoStyleObject
              );
              break;
            case "errorBoxShadow":
              errorStyleObject["box-shadow"] = element;
              break;
            case "errorBorder":
              IDM.style.setBorderStyle(errorStyleObject, element);
              break;
            case "layout":
              IDM.style.setLayoutStyle(innerLayoutStyleObject, element);
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
      if (!this.propData.bgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, this.propData);
      } else if (Object.keys(this.propData.bgList.style).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }

      Object.keys(innerLayoutStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + ">.idm_loopcontainer_box>.idm_module_inner_box",
          innerLayoutStyleObject
        );
      Object.keys(errorStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ">.idm_loopcontainer_box>.idm_module_inner_box.error-state",
          errorStyleObject
        );
      Object.keys(styleObject).length &&
        IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      if (this.innerAttr && this.innerAttr.length > 0) {
        this.innerAttr.forEach((element) => {
          this.convertInnerAttrToStyleObject(element.dataAttr);
        });
      }
      this.convertTitleBoxAttrToStyleObject();
      this.convertTitleAttrToStyleObject();
      this.convertAddNewAttrToStyleObject();
      this.convertTooltipAttrToStyleObject();
      this.convertFooterBoxAttrToStyleObject();
      this.convertThemeListAttrToStyleObject();
      if (this.propData.tempLayout == "table") {
        this.convertTableAttrToStyleObject();
      }
    },
    /**
     * 表格样式转换
     */
    convertTableAttrToStyleObject() {
      var styleObject = {},
        bodyStyleObject = {},
        zebraStyleObject = {},
        boderStyleObject = {};
      const allKey = [
        "tableHeaderfont",
        "tableHeaderBgColor",
        "tableBodyfont",
        "tableBodyBgColor",
        "tableBoderNumber",
        "tableBoderColor",
        "tableBoderType",
      ];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "tableHeaderfont":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "tableHeaderBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = IDM.hex8ToRgbaString(element.hex8);
              }
              break;
            case "tableBodyfont":
              IDM.style.setFontStyle(bodyStyleObject, element);
              break;
            case "tableBodyBgColor":
              if (element && element.hex8) {
                zebraStyleObject["background-color"] = IDM.hex8ToRgbaString(element.hex8);
              }
              break;
            case "tableBoderColor":
              if (element && element.hex8) {
                boderStyleObject[
                  this.propData.tableTheme == "split"
                    ? "border-bottom-color"
                    : "border-color"
                ] = IDM.hex8ToRgbaString(element.hex8);
              }
              break;
            case "tableBoderNumber":
              boderStyleObject[
                this.propData.tableTheme == "split"
                  ? "border-bottom-width"
                  : "border-width"
              ] = element + "px";
              break;
            case "tableBoderType":
              boderStyleObject[
                this.propData.tableTheme == "split"
                  ? "border-bottom-style"
                  : "border-style"
              ] = element;
              break;
          }
        }
      }

      Object.keys(styleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ` .idm_loopcontainer_box .table-field-layout-table .table-field-table-head[idm-ctrl-id="${this.moduleObject.id}"]`,
          styleObject
        );
      Object.keys(bodyStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ` .idm_loopcontainer_box .table-field-layout-table .table-field-table-row[idm-ctrl-id="${this.moduleObject.id}"]>*`,
          bodyStyleObject
        );
      Object.keys(zebraStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ` .idm_loopcontainer_box .table-field-layout-table.table-field-theme-zebra[idm-ctrl-id="${this.moduleObject.id}"]>.table-field-table-row:nth-child(odd)`,
          zebraStyleObject
        );
      this.propData.tableTheme != "zebra" &&
        Object.keys(boderStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ` .idm_loopcontainer_box .table-field-layout-table.table-field-theme-${this.propData.tableTheme} .table-field-table-cell[idm-ctrl-id="${this.moduleObject.id}"]`,
          boderStyleObject
        );
    },
    /**
     * 把属性参数转换成内部容器样式对象
     */
    convertInnerAttrToStyleObject(propData) {
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
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
          }
        }
      }
      if (!propData.bgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, propData);
      } else if (Object.keys(propData.bgList.style).length) {
        Object.assign(styleObject, propData.bgList.style);
      }
      IDM.setStyleToPageHead(
        this.moduleObject.id + ` .drag_container[idm-ctrl-id="${this.moduleObject.id}"]`,
        styleObject
      );
    },
    /**
     * 把标题盒子属性转换成样式对象
     */
    convertTitleBoxAttrToStyleObject() {
      var styleObject = {};
      const keyList = [
        "titleWidth",
        "titleHeight",
        "titleBox",
        "titleBorder",
        "titleFont",
        "titleLayout",
        "titleBoxShadow",
        "titleBgColor"
      ];
      for (const iKey in keyList) {
        const key = keyList[iKey];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "titleWidth":
            case "titleHeight":
              styleObject[key] = element;
              break;
            case "titleBox":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "titleBorder":
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case "titleFont":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "titleLayout":
              IDM.style.setLayoutStyle(styleObject, element);
              break;
            case "titleBoxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "titleBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
          }
        }
      }

      if (!this.propData.titleBgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, this.propData, {
          bgSize: "titleBgSize",
          bgSizeWidth: "titleBgSizeWidth",
          bgSizeHeight: "titleBgSizeHeight",
          positionX: "titlePositionX",
          positionY: "titlePositionY",
          bgColor: "",
          bgImgUrl: "titleBgImgUrl",
          bgRepeat: "titleBgRepeat",
          bgAttachment: "titleBgAttachment",
        });
      } else if (Object.keys(this.propData.titleBgList.style).length) {
        Object.assign(styleObject, this.propData.titleBgList.style);
      }
      IDM.setStyleToPageHead(
        this.moduleObject.id + ` .idm_lc_titlebox[idm-ctrl-id="${this.moduleObject.id}"]`,
        styleObject
      );
    },
    /**
     * 把标题属性转换成样式对象
     */
    convertTitleAttrToStyleObject() {
      this.convertToStyleObjectCommon(
        "titleFont",
        "titleIconColor",
        "titleIconSize",
        "titleLeftMargin",
        "titleIconLeftMargin",
        "idm_lc_title"
      );
    },
    /**
     * 把新增按钮属性转换成样式对象
     */
    convertAddNewAttrToStyleObject() {
      this.convertToStyleObjectCommon(
        "addNewFont",
        "addNewIconColor",
        "addNewIconSize",
        "addNewLeftMargin",
        "addNewIconLeftMargin",
        "idm_lc_addnewbtn"
      );
    },
    /**
     * 把提示属性转换成样式对象
     */
    convertTooltipAttrToStyleObject() {
      this.convertToStyleObjectCommon(
        "tooltipFont",
        "tooltipIconColor",
        "tooltipIconSize",
        "tooltipLeftMargin",
        "tooltipIconLeftMargin",
        "idm_lc_desc"
      );
    },
    /**
     * 公共样式转换方法
     * @param {*} font
     * @param {*} iconColor
     * @param {*} iconSize
     * @param {*} className
     */
    convertToStyleObjectCommon(
      font,
      iconColor,
      iconSize,
      leftMargin,
      iconLeftMargin,
      className
    ) {
      var styleObject = {},
        iconStyleObject = {};
      const allKey = [font, iconColor, iconSize, leftMargin, iconLeftMargin];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case iconColor:
              if (element && element.hex8) {
                iconStyleObject["color"] = IDM.hex8ToRgbaString(element.hex8);
              }
              break;
            case iconSize:
              iconStyleObject["font-size"] = element + "px";
              iconStyleObject["max-height"] = element + "px";
              iconStyleObject["width"] = element + "px";
              break;
            case iconLeftMargin:
              iconStyleObject["margin-right"] = element + "px";
              break;
            case font:
              IDM.style.setFontStyle(styleObject, element);
              break;
            case leftMargin:
              styleObject["padding-left"] = element + "px";
              break;
          }
        }
      }
      Object.keys(styleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id + ` .${className}[idm-ctrl-id="${this.moduleObject.id}"]`,
          styleObject
        );
      Object.keys(iconStyleObject).length &&
        IDM.setStyleToPageHead(
          this.moduleObject.id +
            ` .${className}[idm-ctrl-id="${this.moduleObject.id}"] .idm_lc_svgicon`,
          iconStyleObject
        );
    },
    /**
     * 把标题盒子属性转换成样式对象
     */
    convertFooterBoxAttrToStyleObject() {
      var styleObject = {};
      const keyList = [
        "footerWidth",
        "footerHeight",
        "footerBox",
        "footerBorder",
        "footerFont",
        "footerLayout",
        "footerBoxShadow",
        "footerBgColor"
      ];
      for (const iKey in keyList) {
        const key = keyList[iKey];
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "footerWidth":
            case "footerHeight":
              styleObject[key] = element;
              break;
            case "footerBox":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "footerBorder":
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case "footerFont":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "footerLayout":
              IDM.style.setLayoutStyle(styleObject, element);
              break;
            case "footerBoxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "footerBgColor":
              if (element && element.hex8) {
                styleObject["background-color"] =
                  IDM.hex8ToRgbaString(element.hex8) + "  !important";
              }
              break;
          }
        }
      }
      if (!this.propData.footerBgList?.bgList?.length) {
        IDM.style.setBackgroundStyle(styleObject, this.propData, {
          bgSize: "footerBgSize",
          bgSizeWidth: "footerBgSizeWidth",
          bgSizeHeight: "footerBgSizeHeight",
          positionX: "footerPositionX",
          positionY: "footerPositionY",
          bgColor: "footerBgColor",
          bgImgUrl: "footerBgImgUrl",
          bgRepeat: "footerBgRepeat",
          bgAttachment: "footerBgAttachment",
        });
      } else if (Object.keys(this.propData.footerBgList.style).length) {
        Object.assign(styleObject, this.propData.footerBgList.style);
      }
      IDM.setStyleToPageHead(
        this.moduleObject.id +
          ` .idm_lc_footerbox[idm-ctrl-id="${this.moduleObject.id}"]`,
        styleObject
      );
    },
    getStyle(key) {
      let styles = {};
      switch (key) {
        case "label":
          if (this.propData.labelLayout == "horizontal") {
            switch (this.propData.gridLayout) {
              case "6:12":
              case "6:18":
                styles["width"] = "25%";
                break;
              case "12:12":
                styles["width"] = "50%";
                break;
              default:
                break;
            }
          }
          break;
        case "content":
          if (this.propData.labelLayout == "horizontal") {
            switch (this.propData.gridLayout) {
              case "close":
                styles["width"] = "100%";
                break;
              case "6:12":
                styles["width"] = "66.667%";
                if (this.propData.descPosition == "horizontal") {
                  styles["width"] = "100%";
                }
                break;
              case "6:18":
              case "12:12":
                styles["width"] = "100%";
                break;
            }
          }
          break;
        case "root":
          if (
            this.propData.maxWidth &&
            this.propData.maxWidth.inputVal &&
            this.propData.maxWidth.selectVal
          ) {
            styles["max-width"] =
              this.propData.maxWidth.inputVal + this.propData.maxWidth.selectVal;
          }
          if (
            this.propData.minWidth &&
            this.propData.minWidth.inputVal &&
            this.propData.minWidth.selectVal
          ) {
            styles["min-width"] =
              this.propData.minWidth.inputVal + this.propData.minWidth.selectVal;
          }
          break;
        default:
          break;
      }
      return styles;
    },
  },
};
</script>
<style lang="scss" scoped>
.idm_lc_title,
.idm_lc_desc,
.idm_lc_addnewbtn {
  display: flex;
  align-items: center;
  cursor: pointer;
  .idm_lc_svgicon {
    fill: currentColor;
    vertical-align: middle;
  }
}
.idm_loopcontainer_box,
.idm_loopcontainer_msgbox {
  width: 100%;

  &.layout-horizontal {
    display: table;
    // align-items: center;
    .idm_loopcontainer_label_box {
      display: table-cell;
      padding-right: 16px;
      text-align: right;
      width: 88px;
      padding-right: 16px;
      padding-top: 0;
      vertical-align: middle;
    }
  }
  &.layout-vertical {
    .idm_loopcontainer_label_box {
      width: 100%;
      display: block;
      text-align: left;
      padding-top: 0;
      padding-bottom: 4px;
    }
    .idm_module_inner_box {
      width: 100%;
    }
  }
  .required {
    color: red;
  }
}
.idm_loopcontainer_box {
  .table-field-layout-table {
    display: table;
    margin-bottom: 16px;
    // min-height: 84px;
    position: relative;
    table-layout: fixed;
    width: 100%;
    .table-field-table-head {
      background-color: rgba(31, 56, 88, 0.06);
      color: rgba(0, 0, 0, 0.6);
      display: table-row;
      font-size: 12px;
      font-weight: 700;
      height: 30px;
      line-height: 30px;
      overflow: hidden;
      text-align: left;
      .table-field-table-cell {
        display: table-cell;
        padding: 10px 8px;
      }
    }
    .table-field-table-row {
      display: table-row;
      font-size: 12px;
      overflow: hidden;
      text-align: left;
      .table-field-table-cell {
        display: table-cell;
        padding: 10px 8px;
        vertical-align: middle;
        &.item-idx {
          text-align: center;
        }
      }
    }
    .table-field-table-empty {
      color: #999;
      font-size: 13px;
      height: 50px;
      line-height: 50px;
      position: absolute;
      text-align: center;
      width: 100%;
    }
    &.table-field-theme-zebra .table-field-table-row:nth-child(odd) {
      background-color: rgba(31, 56, 88, 0.04);
    }
    &.table-field-theme-split .table-field-table-cell {
      border-bottom: 1px solid #e8e8e8;
    }
    &.table-field-theme-border {
      border-collapse: collapse;
      .table-field-table-cell {
        border: 1px solid #e8e8e8;
      }
    }
  }
}
</style>
