<template>
  <div
    class="idm_lc_footerbox"
    :idm-ctrl-id="moduleObject.id"
    v-if="(propData.showAddNewBtn && addNewIsShow) || propData.showTooltip"
  >
    <a-button
      class="idm_lc_addnewbtn"
      @click="addComponentData"
      v-if="propData.showAddNewBtn && addNewIsShow"
      :type="propData.addNewBtnType || 'primary'"
      :size="propData.addNewBtnSize || 'default'"
      :shape="propData.addNewBtnShape"
      :idm-ctrl-id="moduleObject.id"
    >
      <svg
        class="idm_lc_svgicon"
        v-if="propData.addNewIcon && propData.addNewIcon.length > 0"
        aria-hidden="true"
      >
        <use :xlink:href="`#${propData.addNewIcon[0]}`"></use>
      </svg>
      {{ propData.addNewTitle || "新增一条" }}
    </a-button>
    <div class="idm_lc_desc" v-if="propData.showTooltip" :idm-ctrl-id="moduleObject.id">
      <svg
        class="idm_lc_svgicon"
        v-if="propData.tooltipIcon && propData.tooltipIcon.length > 0"
        aria-hidden="true"
      >
        <use :xlink:href="`#${propData.tooltipIcon[0]}`"></use>
      </svg>
      <span v-html="getAddDescText()"></span>
    </div>
  </div>
</template>

<script>
import ILoopContainer from "../mixins/ILoopContainer";
export default {
  name: "AddNewButton",
  mixins: [ILoopContainer],
  data() {
    return {
      addNewIsShow: true,
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
  },
  created() {
    if (
      this.propData.addNewShowCustomFunction &&
      this.propData.addNewShowCustomFunction.length
    ) {
      this.addNewIsShow = this.commonCustomEventFunHandle(
        this.propData,
        "addNewShowCustomFunction",
        {
          moduleObject: this.moduleObject,
        }
      );
    }
  },
  methods: {
    addComponentData() {
      let passFlag = true;
      if (
        this.propData.addNewBeforeCustomFunction &&
        this.propData.addNewBeforeCustomFunction.length
      ) {
        passFlag = this.commonCustomEventFunHandle(
          this.propData,
          "addNewBeforeCustomFunction",
          {
            moduleObject: this.moduleObject,
          }
        );
      }
      if (passFlag !== false) {
        this.$emit("click", this);
        if (
          this.propData.addNewLaterCustomFunction &&
          this.propData.addNewLaterCustomFunction.length
        ) {
          this.commonCustomEventFunHandle(this.propData, "addNewLaterCustomFunction", {
            moduleObject: this.moduleObject,
          });
        }
      }
    },
    /**
     * 获取行的标题
     * @param {*} index
     */
    getAddDescText() {
      let title = this.propData.tooltipTitle;
      if (
        this.propData.tooltipTextShowCustomFunction &&
        this.propData.tooltipTextShowCustomFunction.length
      ) {
        title = this.commonCustomEventFunHandle(
          this.propData,
          "tooltipTextShowCustomFunction",
          {
            moduleObject: this.moduleObject,
          }
        );
      }
      return title;
    },
  },
};
</script>

<style lang="scss" scoped></style>
