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
    :idm-refresh-container="activeTab.join(',')"
    class="idm_icollapse_box"
  >
    <!--
      组件内部容器
      增加class="drag_container" 代表内部可存放组件容器 必选
      增加idm-ctrl-inner 代表内部容器组件（可定义单独的属性，只支持定义一类的属性,一个组件内只包含一种） 可选
      idm-ctrl-id：组件的id，这个必须不能为空
      idm-container-index  组件的内部容器索引，不重复唯一且不变，必选，建议从1开始
    -->
    <div class="idm_form_setting_tip" v-if="propData.showComponentTip">
      重要提示：本组件为表单区域分块级别配置专用组件，请按表单要素进行分类配置，最终展现效果需要再次套用最终使用的模板
    </div>
    <a-collapse
      :activeKey="activeTab"
      :bordered="propData.collapseBordered !== false ? true : false"
      :accordion="propData.collapseAccordion === true ? true : false"
      :expandIconPosition="propData.expandIconPosition || 'left'"
      @change="changeCallback"
    >
      <a-collapse-panel forceRender v-for="item in panelList" :showArrow="item.showArrow!==false" :disabled="item.disabled===true" :key="item.key">
        <div
          class="drag_container"
          v-if="item.opened"
          :class="`idm-collapse-inner-${item.key}`"
          idm-ctrl-inner
          :idm-ctrl-id="moduleObject.id"
          :idm-container-index="item.key"
        >
          <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
          <slot :name="moduleObject.id+item.key"></slot>
        </div>
        <span slot="header">
          <div
            v-if="item.panelTitleSlotFunction && item.panelTitleSlotFunction.length > 0"
            v-html="getTabCustomRender(item)"
          ></div>
          <template v-else>{{ item.tab }}</template>
        </span>
        <div
          v-if="
            propData.tabBarExtraContentFunction &&
            propData.tabBarExtraContentFunction.length > 0
          "
          slot="extra"
        >
          <div
            @click="tabBarExtraClickFunction(item)"
            v-if="
              propData.tabBarExtraContentFunction &&
              propData.tabBarExtraContentFunction.length > 0
            "
            v-html="getTabBarExtraContentCustomRender(item)"
          ></div>
        </div>
      </a-collapse-panel>
    </a-collapse>
    <div
      v-if="propData.showDragContainer"
      v-show="this.moduleObject.env != 'production' || showDragContainer"
      class="idm_itabs_drag_container"
      :style="{ left: propData.dragContainerX, top: propData.dragContainerY }"
    >
      <div
        class="drag_container"
        idm-ctrl-inner
        :idm-ctrl-id="moduleObject.id"
        idm-container-index="1"
      >
      <!--统一的插槽写法，主要用于vue组件，其他语言的脚手架可忽略-->
      <slot :name="moduleObject.id+1"></slot>
      </div>
    </div>
  </div>
</template>

<script>

import 'ant-design-vue/lib/collapse/style/css';
import {
  Collapse
} from 'ant-design-vue';
export default {
  name: "ICollapse",
  data() {
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr || {
        showComponentTip:true,
        dragContainerY: "8px",
        dragContainerX: "60%",
        showDragContainer: false,
      },
      innerAttr: this._propData?.innerAttr||this.$root?.propData?.innerAttr || [],
      activeTab: [],
      panelList: [],
      showDragContainer: false,
    };
  },
  components: {
    [Collapse.name]: Collapse,
    [Collapse.Panel.name]: Collapse.Panel
  },
  props: {
    _moduleObject: Object,
    _propData: Object
  },
  created() {
    this.moduleObject = this._moduleObject||this.$root.moduleObject;
    // console.log(this.moduleObject)
    this.initAttrToModule();
  },
  mounted() {
    //直接使用组件此处的回调必须的
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
  },
  destroyed() {},
  methods: {
    /**
     * 切换面板的回调
     */
    changeCallback(keys) {
      if(IDM.type(keys)!="array"){
        keys = [keys]
      }
      let that = this;
      //比对当前展开的哪一个
      let changeType = "open";
      let key = _.difference(keys,this.activeTab);
      if(!key.length){
        key = _.difference(this.activeTab,keys);
        changeType = "close";
      }
      if(!key.length){
        return;
      }
      key = key[0];
      this.activeTab = keys;
      this.panelList.forEach((item) => {
        if (key==item.key) {
          if (!item.opened) {
            item.opened = true;
            that.$nextTick(function (params) {
              //去加载内部组件
              that.moduleObject.moduleReload &&
                that.moduleObject.moduleReload(that.moduleObject.packageid, item.key);
            });
          }
          // item.opened = true;
        }
      });
      this.dragContainerShowStatusHandle("changeTab",key,changeType);
      this.changeEventFunHandle("changeFunction");
    },
    tabBarExtraClickFunction(item){
      IDM.invokeCustomFunctions.apply(this, [
          this.propData.tabBarExtraClickFunction,
          {
            clickItem:item,
            activeKey: this.activeTab,
            allKey: this.panelList,
          },
        ]);
    },
    /**
     * 通用自定义函数
     */
    changeEventFunHandle(name) {
      let that = this;
      var customHandle = that.propData[name];
      customHandle &&
        customHandle.forEach((item) => {
          window[item.name] &&
            window[item.name].call(this, {
              ...that.commonParam(),
              customParam: item.param,
              _this: that,
              activeKey: that.activeTab,
              allKey: that.panelList,
            });
        });
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
     * 获取扩展的结果
     */
    getTabBarExtraContentCustomRender(item) {
      return (
        window[this.propData.tabBarExtraContentFunction[0].name] &&
        window[this.propData.tabBarExtraContentFunction[0].name].call(this, {
          customParam: this.propData.tabBarExtraContentFunction[0].param,
          panelList: this.panelList,
          item
        })
      );
    },
    /**
     * 获取tab自定义的数据
     */
    getTabCustomRender(item) {
      if (item.panelTitleSlotFunction && item.panelTitleSlotFunction.length > 0) {
        if (!window[item.panelTitleSlotFunction[0].name]) {
          return this.moduleObject.env == "develop" ? "请把动作面板打开" : "";
        }
        return (
          window[item.panelTitleSlotFunction[0].name] &&
          window[item.panelTitleSlotFunction[0].name].call(this, {
            customParam: item.panelTitleSlotFunction[0].param,
            tab: item,
          })
        );
      } else {
        return "方法未找到";
      }
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.innerAttr = propData.innerAttr || [];
      this.initAttrToModule();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      const keyList = [
        "width",
        "height",
        "minWidth",
        "minHeight",
        "box",
        "border",
        "font",
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
            case "minWidth":
              styleObject["min-width"] = element;
              break;
            case "minHeight":
              styleObject["min-height"] = element;
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
      if (Object.keys(this.propData.bgList?.style||{}).length) {
        Object.assign(styleObject, this.propData.bgList.style);
      }
      IDM.setStyleToPageHead(this.moduleObject.id + "", styleObject);
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
    /**
     * 加载基本属性
     */
    initBaseAttrToModule() {
      if (this.propData.TabPaneList && this.propData.TabPaneList.length > 0) {
        if (this.moduleObject.env != "develop") {
          this.activeTab = [];
          this.propData.TabPaneList.forEach((tabItem) => {
            if (tabItem.defaultActiveKey) {
              this.activeTab.push(tabItem.key);
            }
          });
        }
        if (this.moduleObject.env == "develop") {
          if(!this.activeTab.length){
            this.activeTab = this.propData.TabPaneList.map(item=>item.key);
          }
        }
        //设置初始化状态打开状态
        this.propData.TabPaneList.forEach((tabItem, index) => {
          tabItem.opened =
            this.moduleObject.env == "develop" ? true : this.activeTab.includes(tabItem.key);
          if (!tabItem.forceRender) {
            tabItem.opened = true;
          }
        });

        this.panelList = this.propData.TabPaneList;
      } else {
        this.panelList = [];
        if (this.moduleObject.env == undefined || this.moduleObject.env == "develop") {
          //开发模式下不执行此事件
          this.panelList = [
            {
              key: "123",
              tab: "面板demo",
              defaultActiveKey: true,
              forceRender: false,
              showArrow:true
            },
            {
              key: "1233",
              tab: "面板demo1",
              defaultActiveKey: true,
              forceRender: false,
              showArrow:true
            },
          ];
          if(!this.activeTab.length){
            this.activeTab.push(this.panelList[0].key)
          }
        }
      }
      this.showDragContainer = this.propData.dragContainerShowType == "default";
      this.dragContainerShowStatusHandle("changeTab",this.activeTab.length?this.activeTab[0]:"","open");
    },
    /**
     * 加载属性到组件中
     */
    initAttrToModule() {
      this.convertAttrToStyleObject();
      if (this.innerAttr && this.innerAttr.length > 0) {
        this.innerAttr.forEach((element) => {
          this.convertInnerAttrToStyleObject(element.dataAttr, element.containerIndex);
        });
      }
      this.initBaseAttrToModule();
    },
    /**
     * 悬浮容器显示处理事件
     */
    dragContainerShowStatusHandle(actionType,activeKey,changeType) {
      if (
        this.propData.dragContainerShowType == "default" ||
        this.propData.showDragContainer === false
      ) {
        return;
      }
      switch (this.propData.dragContainerShowType) {
        case "toggle":
          //用当前选中的页签对象去执行表达式
          if (
            this.getExpressData(
              "data",
              this.propData.dragContainerDataFiled,
              this.panelList.find((item) => item.key === activeKey) || {}
            )
          ) {
            this.showDragContainer = true;
          } else {
            this.showDragContainer = false;
          }
          break;
        case "dynamic":
          break;
        case "custom":
          this.showDragContainer =
            window[this.propData.dragContainerDataFunction[0].name] &&
            window[this.propData.dragContainerDataFunction[0].name].call(this, {
              ...this.commonParam(),
              customParam: this.propData.dragContainerDataFunction[0].param,
              _this: this,
              currentActiveKey:activeKey,
              activeTab:this.activeTab,
              allKey: this.panelList,
              actionType,
              changeType
            });
          break;
      }
    },
    /**
     * 根据结果集来执行表达式的结果
     * dataName：结果集名，建议直接data即可
     * dataFiled：表达式
     * resultData：要查下的结果集
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
      return _defaultVal;
    },
  },
};
</script>
<style lang="scss">
.idm_itabs_drag_container {
  position: absolute;
  top: 0;
  left: 0;
}
.idm_icollapse_box{
  .idm_form_setting_tip{
    border: 1px solid #F59A23;
    background-color: rgba($color: #F59A23, $alpha: 0.24);
    color: #B8741A;
    padding: 10px;
    text-align: center;
    margin-bottom: 10px;
  }
}
</style>
