<template>
  <div class="idm_lc_operate">
    <template v-for="(item, index) in commonButtonList">
      <div
        v-if="switchButtonShow(item, index)"
        :key="index"
        class="idm_lc_operate_common"
        :style="convertToStyleObjectBox(item, 'btnFont', 'btnLeftMargin')"
        :idm-ctrl-id="moduleObject.id"
        @click="buttonClick(item, index)"
      >
        <svg
          class="idm_lc_svgicon"
          :style="
            convertToStyleObjectIcon(
              item,
              'btnIconColor',
              'btnIconSize',
              'btnIconLeftMargin'
            )
          "
          v-if="item.btnIcon && item.btnIcon.length > 0"
          aria-hidden="true"
        >
          <use :xlink:href="`#${item.btnIcon[0]}`"></use>
        </svg>
        {{ item.btnTitle }}
      </div>
    </template>

    <a-dropdown v-if="MoreButtonList.length">
      <div
        class="idm_lc_operate_common idm_lc_operate_more"
        :idm-ctrl-id="moduleObject.id"
        :style="
          convertToStyleObjectBox(
            commonButtonList.length
              ? commonButtonList[commonButtonList.length - 1]
              : MoreButtonList[0],
            'btnFont',
            'btnLeftMargin'
          )
        "
      >
        更多 <a-icon type="down" />
      </div>
      <a-menu slot="overlay">
        <template v-for="(item, index) in MoreButtonList">
          <a-menu-item :key="index" v-if="switchButtonShow(item, index)">
            <div
              class="idm_lc_operate_common"
              :idm-ctrl-id="moduleObject.id"
              @click="buttonClick(item, index)"
              :style="convertToStyleObjectBox(item, 'btnFont', 'btnLeftMargin')"
            >
              <svg
                class="idm_lc_svgicon"
                :style="
                  convertToStyleObjectIcon(
                    item,
                    'btnIconColor',
                    'btnIconSize',
                    'btnIconLeftMargin'
                  )
                "
                v-if="item.btnIcon && item.btnIcon.length > 0"
                aria-hidden="true"
              >
                <use :xlink:href="`#${item.btnIcon[0]}`"></use>
              </svg>
              {{ item.btnTitle }}
            </div>
          </a-menu-item>
        </template>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import ILoopContainer from "../mixins/ILoopContainer";
export default {
  name: "OperateButtonList",
  mixins: [ILoopContainer],
  data() {
    return {
      MoreButtonList: [],
      commonButtonList: [],
    };
  },
  props: {
    propData: {
      type: Object,
      default: () => {},
    },
    moduleObject: {
      type: Object,
      default: () => {},
    },
    itemData: {
      type: Object,
      default: () => {},
    },
    componentData: {
      type: Object,
      default: () => [],
    },
    itemIndex: {
      type: Number,
    },
    componentEditStatus: {
      type: Boolean,
      default: true,
    },
  },
  created() {
    this.MoreButtonList = this.propData.handleButtonList?.filter(
      (item) => item.moveShowMoreDropDownList
    );
    this.commonButtonList = this.propData.handleButtonList?.filter(
      (item) => !item.moveShowMoreDropDownList
    );
  },
  methods: {
    /**
     * 判断按钮是否显示
     * @param {*} configObject
     * @param {*} configIndex
     */
    switchButtonShow(configObject, configIndex) {
      let result = true;
      if (configObject.showCustomFunction && configObject.showCustomFunction.length) {
        result = this.commonCustomEventFunHandle(configObject, "showCustomFunction", {
          index: this.itemIndex,
          itemObject: this.itemData,
          configObject,
          configIndex,
        });
      } else if (configObject.showCustomExpression) {
        result = IDM.express.replace("@[" + configObject.showCustomExpression + "]", {
          index: this.itemIndex,
          itemObject: this.itemData,
          configObject,
          configIndex,
        });
      }
      //至少保留一条数据清空下最后一条不允许删除
      if (
        this.propData.reserveOneData &&
        this.componentData.length < 2 &&
        configObject.buttonHandleType == "del"
      ) {
        result = false;
      }
      //只读状态下控制能操作按钮都不能显示
      if (
        !this.componentEditStatus &&
        ["insert", "del", "upsort", "downsort"].includes(configObject.buttonHandleType)
      ) {
        result = false;
      }
      //第一条上不显示和最后一条下不显示
      if (
        (this.itemIndex == 0 && configObject.buttonHandleType == "upsort") ||
        (this.itemIndex == this.componentData.length - 1 &&
          configObject.buttonHandleType == "downsort")
      ) {
        result = false;
      }
      return result;
    },
    /**
     * 按钮点击事件
     * @param {*} configObject
     * @param {*} configIndex
     */
    buttonClick(configObject, configIndex) {
      let passFlag = true;
      if (configObject.beforeCustomFunction && configObject.beforeCustomFunction.length) {
        passFlag = this.commonCustomEventFunHandle(configObject, "beforeCustomFunction", {
          index: this.itemIndex,
          itemObject: this.itemData,
          configObject,
          configIndex,
        });
      }
      if (passFlag !== false) {
        this.$emit("click", this.itemData, this.itemIndex, configObject, configIndex);
        //执行动作后的处理函数
        if (configObject.laterCustomFunction && configObject.laterCustomFunction.length) {
          this.commonCustomEventFunHandle(configObject, "laterCustomFunction", {
            index: this.itemIndex,
            itemObject: this.itemData,
            configObject,
            configIndex,
          });
        }
      }
    },
    /**
     * 公共样式转换方法
     */
    convertToStyleObjectBox(propData, font, leftMargin) {
      var styleObject = {};
      const allKey = [font, leftMargin];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case font:
              IDM.style.setFontStyle(styleObject, element);
              break;
            case leftMargin:
              styleObject["padding-left"] = element + "px";
              break;
          }
        }
      }
      return styleObject;
    },
    /**
     * 公共样式转换方法
     */
    convertToStyleObjectIcon(propData, iconColor, iconSize, iconLeftMargin) {
      var iconStyleObject = {};
      const allKey = [iconColor, iconSize, iconLeftMargin];
      for (let index = 0; index < allKey.length; index++) {
        const key = allKey[index];
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
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
          }
        }
      }
      return iconStyleObject;
    },
  },
};
</script>

<style lang="scss" scoped>
.idm_lc_operate_common {
  display: flex;
  align-items: center;
  cursor: pointer;
  .idm_lc_svgicon {
    fill: currentColor;
    vertical-align: middle;
  }
  &:hover {
    opacity: 0.9;
  }
}
.idm_lc_operate {
  display: flex;
  align-items: center;
}
</style>
