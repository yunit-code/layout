<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="idm-full-screen-layout" :style="computedWidth">
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
    <!--预览模式下-->
    <div class="idm-full-screen-layout-box" ref="refFslBgGrid" v-if="moduleObject.env=='production'" :class="{'no-layout':layoutMode==1||layoutFooterMode!=-1}" >
      <!--容器层（已选中的）-->
      <div class="fsl-box-body">
        <div class="fsl-region-element"
         v-for="(item,index) in chooseGridListFull" 
         :ref="`env_production_grid_${item.itemNo}`"
         :class="{
           'layout-mode-common':layoutMode==1,
           //当在实际的运行环境中边框和底色都不要显示的env=='production'
           'module_env_production':moduleObject.env=='production'}"
         :key="index" :style="getStyleObject(item)">
         <!--真正的存放组件容器-->
         <div class="fsl-region-element-inner-preview drag_container"
         :ref="'region_element_'+item.itemNo"
          idm-ctrl-inner
          :idm-ctrl-id="moduleObject.id"
          :idm-container-index="item.itemNo">

         </div>
        </div>
      </div>
    </div>
    <!--开发模式下-->
    <div class="idm-full-screen-layout-box" ref="refFslBgGrid" v-else :class="{'no-layout':layoutMode==1||layoutFooterMode!=-1}" >
      <!--百格布局底图，只用于设计时候展示-->
      <div class="fsl-bg-grid" v-if="moduleObject.env!='production'" @mousedown="gridMousedownHandle">
        <div class="horizontal-line" v-for="(item,index) in (gridNumber+1)" :key="index" :style="{top:(index*(100/gridNumber))+'%'}"></div>
        <div class="vertical-line" v-for="(item,index) in (gridNumber+1)" :key="index" :style="{left:(index*(100/gridNumber))+'%'}"></div>
      </div>
      <!--容器层（已选中的）-->
      <div class="fsl-box-body">
        <div class="fsl-region-element"
         v-for="(item,index) in chooseGridListFull" 
         :ref="`env_develop_grid_${item.itemNo}`"
         :class="{
           'layout-mode-common':layoutMode==1,
           //当在实际的运行环境中边框和底色都不要显示的env=='production'
           'module_env_production':moduleObject.env=='production',
           'active':getCurrentItem(item).moveActive}"
         :key="index" @click="gridElementClickHandle($event,getCurrentItem(item))"
         :style="{'left':getCurrentItem(item).xRatio+'%','top':getCurrentItem(item).yRatio+'%','width':getCurrentItem(item).width+'%','height':getCurrentItem(item).height+'%','border-width':(existsChooseGridList(item)?1:0)+'px'}">
         <!--布局开发层面-->
         <div class="fsl-region-element-inner-develop" v-show="layoutMode==0" v-if="moduleObject.env!='production'">
           <div class="fsl-element-number default-show">{{item.itemNo}}</div>
           <!-- <div class="fsl-element-where-font default-show">显示条件：{{item.minWidthShow==0&&item.minHeightShow==0?'始终显示':`页面宽>=${item.minWidthShow},页面高>=${item.minHeightShow}`}}</div> -->
           <div class="fsl-element-item-delete" @click="deleteLayout(getCurrentItem(item),getCurrentItemIndex(item,index))">
             <svg viewBox="0 0 1024 1024"><path d="M803.34 968.45H220.66c-19.58 0-35.5-15.92-35.5-35.5V228.41h653.68v704.54c0 19.57-15.92 35.5-35.5 35.5z m-555.18-63h527.68V291.41H248.16v614.04z" p-id="7333"></path><path d="M885.08 291.41H138.92c-17.4 0-31.5-14.1-31.5-31.5s14.1-31.5 31.5-31.5h746.17c17.4 0 31.5 14.1 31.5 31.5s-14.11 31.5-31.51 31.5zM342.21 826.75c-17.4 0-31.5-14.1-31.5-31.5V391.79c0-17.4 14.1-31.5 31.5-31.5s31.5 14.1 31.5 31.5v403.46c0 17.39-14.1 31.5-31.5 31.5zM509.77 826.75c-17.4 0-31.5-14.1-31.5-31.5V391.79c0-17.4 14.1-31.5 31.5-31.5s31.5 14.1 31.5 31.5v403.46c0 17.39-14.11 31.5-31.5 31.5zM677.32 826.75c-17.4 0-31.5-14.1-31.5-31.5V391.79c0-17.4 14.1-31.5 31.5-31.5s31.5 14.1 31.5 31.5v403.46c0 17.39-14.1 31.5-31.5 31.5zM702.12 205.01h-63v-86.46h-258.7v86.46h-63v-96.96c0-15.18 7.15-29.58 19.63-39.5 10.54-8.38 24.13-13 38.28-13h268.9c14.15 0 27.74 4.62 38.28 13 12.47 9.92 19.63 24.32 19.63 39.5v96.96z" p-id="7334"></path></svg>
           </div>
           <!--8个控制点+整体移动-->
           <div class="fsl-element-ctrl-center"
            @mousedown="gridAnchorMousedownHandle($event,getCurrentItem(item),'center')">
             <svg viewBox="0 0 1024 1024"><path d="M486.4 776.533333v-213.333333H247.466667v106.666667L85.333333 512l162.133334-162.133333V512h238.933333V247.466667H349.866667L512 85.333333l162.133333 162.133334h-132.266666V512h238.933333V349.866667L938.666667 512l-162.133334 162.133333v-106.666666h-238.933333v213.333333h132.266667L512 938.666667l-162.133333-162.133334h136.533333z" p-id="2016"></path></svg>
           </div>
           <div v-for="(ikey,sindex) in ['topleft','top','topright','left','right','bottomleft','bottom','bottomright']"
            :key="sindex" 
            :class="'fsl-element-ctrl-anchor fsl-element-ctrl-'+ikey" 
            @mousedown="gridAnchorMousedownHandle($event,getCurrentItem(item),ikey)"></div>

         </div>
         <!--真正的存放组件容器-->
         <div class="fsl-region-element-inner-preview drag_container"
          idm-ctrl-inner
          :idm-ctrl-id="moduleObject.id"
          :idm-container-index="item.itemNo">

         </div>
        </div>
      </div>
      <!--框选层-->
      <div class="fsl-mouse-region-element" v-if="movePosObject.width>0&&movePosObject.height>0" :style="{'left':movePosObject.xRatio+'%','top':movePosObject.yRatio+'%','width':movePosObject.width+'%','height':movePosObject.height+'%'}">

      </div>
      <!--布局模式切换按钮，只用于设计时候展示-->
      <div class="fsl-layout-switch-tool" v-if="moduleObject.env!='production'">
        <div :class="{'active':layoutMode===0}" @click="layoutMode=0">布局模式</div>
        <div :class="{'active':layoutMode===1}" @click="layoutMode=1">排版模式</div>
      </div>
      <!--布局分辨率切换-->
      <div class="fsl-layout-footer-switch-tool" v-if="moduleObject.env!='production'">
        <div :class="{'active':layoutFooterMode===-1}"  @click="footerLayoutSwitch(null,-1)">完整布局&nbsp;
          <a-tooltip placement="top">
            <template slot="title">
              <span>完整布局是指在最大分辨率情况下显示的布局，右侧能新增的自定义响应式布局只能在当前完整布局下删减布局，无法新增布局。如果完整布局发生变化，右侧自定义响应式布局可点击名称左边的重置功能图标进行重新布局。如果配置了响应式布局而实际条件不满足任何一个响应式布局时则同样显示该完整布局</span>
            </template>
            <a-icon type="question-circle" />
          </a-tooltip>
        </div>
        <div v-for="(fitem,findex) in chooseGridMediaList" :key="findex" @click="footerLayoutSwitch(fitem,findex)" :class="{'active':layoutFooterMode==findex}">
          <a-tooltip placement="top" title="点击重置成跟“完整布局”一样的结构">
            <a-icon type="reload" @click="resetMediaObjectGridList(fitem)"/>
          </a-tooltip>
          <a-tooltip placement="top" title="双击可修改宽高">
            <span v-show="!fitem.isEdit" @dblclick="editMediaWH(fitem,findex)">&nbsp;宽>={{fitem.w}},高>={{fitem.h}}&nbsp;</span>
          </a-tooltip>
          <input v-show="fitem.isEdit" title="失去焦点或回车即可完成修改" :ref="`mediawhinput_`+findex" :value="fitem.w+','+fitem.h" @keyup.enter="mediaInputBlurHandle($event,fitem,findex)" @blur="mediaInputBlurHandle($event,fitem,findex)"/>
          <a-tooltip placement="top" title="点击删除布局">
            <a-icon type="close" @click="removeMediaObject(fitem,findex)"/>
          </a-tooltip>
        </div>
        <a-tooltip placement="top" title="温馨提示：建议将完整布局完成后再新增自定义响应式布局">
          <div @click="addMediaObjectToList">
            <a-icon type="plus" />
          </div>
        </a-tooltip>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * ResizeObserver是新的实验中的API，可以通过构造一个 ResizeObserver 对象以观察者模式监听任意 Element / SvgElement 的尺寸变化。
 * 除了chrome 64+ 和最新的 Edge Insider版支持，其他浏览器均不支持此API。因此才使用第三方的polyfill方案，可以支持到 FF44+，IE9+，Edge 10+ ，Safari 11+ 
 * 兼容方案是通过 MutationObserver API 实现的，通过监听 dom 的变化并加以判断，至此主流浏览器均可运行。非轮询监控，所以不会造成性能问题。
 */
import ResizeObserver from 'resize-observer-polyfill';

export default {
  name: 'IFullScreenLayout',
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{},
      innerAttr:this.$root.propData.innerAttr||[],
      //当前鼠标移动的对象数据
      movePosObject:{x:0,y:0,width:0,height:0,xRatio:0,yRatio:0,moveActive:false,minWidthShow:0,minHeightShow:0},
      //区域计算差值，主要是相交点不知道是否在区域内，所以把已存在的区域全部缩小这个差值方便进行比对
      regionDiffNumPX:3,
      //要显示的格子数
      gridNumber:20,
      //已选中的单元格列表
      chooseGridList:[],
      //完整的单元格列表备份
      chooseGridListFull:[],
      //布局模式：0布局模式，1：普通模式
      layoutMode:0,
      //底部布局模式：0完整布局，
      layoutFooterMode:-1,
      //已选择的响应式布局{w:1600,h:800,grid:chooseGridList}
      chooseGridMediaList:[],
      //当前适配确定后的响应式布局
      productionMediaGridList:[],
      computedWidth: {}
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.layoutMode = this.moduleObject.env!='production'?this.layoutMode:1
    this.chooseGridList = this.propData.chooseGridList||[];
    this.chooseGridListFull = _.cloneDeep(this.chooseGridList);
    this.convertAttrToStyleObject();
  },
  mounted() {
    const that = this;
    this.$nextTick(function (params) {
      // if(this.moduleObject.env=='production'){
      // }
      that.autoLayout();
      //监测元素改变事件
      const ro = new ResizeObserver((entries, observer) => {
        // console.log("🚀 ~ file: IFullScreenLayout.vue ~ line 120 ~ ro ~ entries, observer", entries, observer)
        for (const entry of entries) {
            // const {left, top, width, height} = entry.contentRect;
            // console.log('Element:', entry.target);
            // console.log(`Element's size: ${ width }px x ${ height }px`);
            // console.log(`Element's paddings: ${ top }px ; ${ left }px`);
            that.autoLayout();
        }
      });
      ro.observe(document.querySelector("#"+this.moduleObject.id));
    });
    this.initHandle();
    console.log(this.propData, '初始化');
  },
  destroyed() {},
  methods:{
    /**
     * 初始化事件
    */
    initHandle () {
      if (this.propData.fitMenu) {
        this.computedWidth = {width: `calc(${this.propData.width} - ${this.propData.menuWidthMax})`};
      }
      this.propData.chooseGridMediaList = (this.propData.chooseGridMediaList || []).length > 0 ? this.propData.chooseGridMediaList : this.chooseGridMediaList;
    },
    existsChooseGridList(item){
      if(this.layoutFooterMode==-1){
        return true;
      }
      let itemExists = false;
      this.chooseGridList.forEach((sitem,index)=>{
        if(item.itemNo==sitem.itemNo){
          itemExists = true;
        }
      })
      return itemExists;
    },
    getCurrentItem(item){
      //不能启用，否则第一次则无效
      // if(this.layoutFooterMode==-1){
      // console.log("🚀 ~ file: IFullScreenLayout.vue ~ line 218 ~ getCurrentItem ~ item", item)
      //   return item;
      // }
      let newItem={x:0,y:0,xRatio:0,yRatio:0,width:0,height:0};
      this.chooseGridList.forEach((sitem,index)=>{
        if(item.itemNo==sitem.itemNo){
          newItem = sitem;
        }
      })
      return newItem;
    },
    getCurrentItemIndex(item,index){
      // if(this.layoutFooterMode==-1){
      //   return index;
      // }
      let newIndex;
      this.chooseGridList.forEach((sitem,index)=>{
        if(item.itemNo==sitem.itemNo){
          newIndex = index;
        }
      })
      return newIndex;
    },
    getStyleObject(item){
      const autoLayoutType = this.propData.autoLayoutType||"close";
      if(autoLayoutType=="close"){
        return {'display':'block','left':item.xRatio+'%','top':item.yRatio+'%','width':item.width+'%','height':item.height+'%'};
      }
      let newItem;
      this.productionMediaGridList.forEach(sitem=>{
        if(item.itemNo==sitem.itemNo){
          newItem = sitem;
        }
      })
      if(!newItem){
        return {'display':'none'};
      }
      return {'display':'block','left':newItem.xRatio+'%','top':newItem.yRatio+'%','width':newItem.width+'%','height':newItem.height+'%'};
      
    },
    /**
     * 底部的工具栏布局切换
     */
    footerLayoutSwitch(item,index){
      this.layoutFooterMode = index;
      if (this.chooseGridMediaList.length === index) {
        this.layoutFooterMode = this.layoutFooterMode-1
      }
      if(index==-1){
        this.chooseGridList = this.chooseGridListFull;
      }else{
        this.chooseGridList = item.gridList;
      }
    },
    /**
     * 文本框失去焦点和回车调用的方法
     */
    mediaInputBlurHandle(e,item,index){
      item.isEdit=false;
      const value = e.target.value;
      if(!value){
        return;
      }
      let valArray = value.split(",");
      if(valArray.length==1){
        valArray = value.split("，");
      }
      item.w = parseInt(isNaN(valArray[0])?0:valArray[0]);
      if(valArray.length>1){
        item.h = parseInt(isNaN(valArray[1])?0:valArray[1]);
      }else{
        item.h = 0;
      }
      this.setPropDataToDevelopAttrData({chooseGridMediaList:_.cloneDeep(this.chooseGridMediaList)});
    },
    /**
     * 编辑布局的宽高
     */
    editMediaWH(item,index){
      let that = this;
      item.isEdit = true;
      setTimeout(() => {
        // that.$refs["mediawhinput_"+index][0].focus();
        that.$refs["mediawhinput_"+index][0].select();
      }, 10);
    },
    /**
     * 重置恢复现有布局
     */
    resetMediaObjectGridList(fitem){
      fitem.gridList = _.cloneDeep(this.chooseGridListFull);
      this.setPropDataToDevelopAttrData({chooseGridMediaList:_.cloneDeep(this.chooseGridMediaList)});
    },
    /**
     * 移除布局
     */
    removeMediaObject(item,index){
      let that = this;
      if(this.layoutFooterMode==index){
        //如果删除当前布局这重新选择完整布局
        setTimeout(() => {
          that.footerLayoutSwitch(null,-1)
        }, 1);
      }
      this.chooseGridMediaList.splice(index,1);
      this.setPropDataToDevelopAttrData({chooseGridMediaList:_.cloneDeep(this.chooseGridMediaList)});
    },
    /**
     * 追加布局
     */
    addMediaObjectToList(){
      this.chooseGridMediaList.push({w:1600,h:800,gridList:_.cloneDeep(this.chooseGridListFull),isEdit:false, powerActive: true, powerList: [], isShowFunction: []});
      this.footerLayoutSwitch(this.chooseGridMediaList[this.chooseGridMediaList.length-1],this.chooseGridMediaList.length-1)
      this.setPropDataToDevelopAttrData({chooseGridMediaList:_.cloneDeep(this.chooseGridMediaList)});
    },
    /**
     * 自动布局
     */
    autoLayout(){
      //非预览模式下不实现自动布局
      // if(this.moduleObject.env!='production'){
      //   return;
      // }
      const autoLayoutType = this.propData.autoLayoutType||"close";
      if(autoLayoutType=="close"){
        this.autoLayoutSendLayoutInfoToChildrenMsg(this.chooseGridListFull);
        return;
      }
      const whObject = IDM.getClientWH();//{width: 1159, height: 829}
      let maxMediaObject = {w:0,h:0,gridList:this.chooseGridListFull};
      for (let i=0; i<this.propData.chooseGridMediaList.length; i++) {
        let item = this.propData.chooseGridMediaList[i];
        if((whObject.width>=item.w||!item.w)&&(whObject.height>=item.h||!item.h)){
          if(item.w>=maxMediaObject.w&&item.h>=maxMediaObject.h){
            //如果宽度大于还不够，必须要高度也是大于才能将其替换
            if (item.isShowFunction && item.isShowFunction.length > 0) { // 判断如果页签有自定义函数 返回true 则替换
              if (window[item.isShowFunction[0].name]&&window[item.isShowFunction[0].name].call(this,{ customParam: item.isShowFunction[0].param, _this:this })) {
                maxMediaObject = item;
              } else {
                continue;
              }
            } else {
              maxMediaObject = item;
            }
          }
        }
      }
      this.productionMediaGridList = maxMediaObject.gridList;
      this.autoLayoutSendLayoutInfoToChildrenMsg(this.productionMediaGridList);

    },
    autoLayoutSendLayoutInfoToChildrenMsg(gridList){
      //IDM.broadcast.sendChildren({"type":"regionResize","message":{w:800,h:600},module:{"packageid":"component_LEaFl0DL0wMq7Y10","containerIndex":"1"}});
      this.$nextTick(function(){
        const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
        //单元格的宽与高
        // const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
        const refName = this.moduleObject.env=="production"?"env_production_grid_":"env_develop_grid_"
        gridList&&gridList.forEach(item=>{
          IDM.broadcast.sendChildren({"type":"regionResize","message":{
            regionObject:_.cloneDeep(item),
            gridEleTarget:this.$refs[refName+item.itemNo] instanceof Array?this.$refs[refName+item.itemNo][0]:this.$refs[refName+item.itemNo],
            eleTarget:this.$refs["region_element_"+item.itemNo] instanceof Array?this.$refs["region_element_"+item.itemNo][0]:this.$refs["region_element_"+item.itemNo],
            outBoundingClientRect:_.cloneDeep(outBoxPos)
          },module:{"packageid":this.moduleObject.packageid,"containerIndex":item.itemNo}});
        })
      });
    },
    deleteLayout(item,index){
      this.chooseGridList.splice(index,1);
      this.setPropDataToDevelopAttrData({chooseGridList:this.chooseGridList});
    },
    /**
     * 单个格子的鼠标点击事件
     */
    gridAnchorMousedownHandle(eT,item,type){
      let that = this;
      that._stopPropagation(eT);
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      // console.log("🚀 ~ file: IFullScreenLayout.vue ~ line 101 ~ gridAnchorMousedownHandle ~ outBoxPos", outBoxPos)
      //单元格的宽与高
      const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      //进行x、y数据转换,因为窗口会缩小放大
      this.chooseGridList&&this.chooseGridList.forEach(item=>{
        item.x = (item.xRatio/100)*outBoxPos.width;
        item.y = (item.yRatio/100)*outBoxPos.height;
      })
      // console.log("🚀 ~ file: IFullScreenLayout.vue ~ line 392 ~ gridAnchorMousedownHandle ~ this.chooseGridList", this.chooseGridList)

      //鼠标按下时的坐标
      let mouseStartPosObject = {
        startX:eT.clientX-outBoxPos.x,
        startY:eT.clientY-outBoxPos.y
      }
      
      var moveEvent = function(e){
        const lsitem = _.cloneDeep(item);
        item.moveActive = true;
        //鼠标按下的坐标
        const mouseDownPos = e;

        let movePosObject = {};
        //真实的起点坐标
        movePosObject.startX = mouseDownPos.clientX-outBoxPos.x;
        movePosObject.startY = mouseDownPos.clientY-outBoxPos.y;
        if(movePosObject.startX<0||movePosObject.startY<0||movePosObject.startX>outBoxPos.width||movePosObject.startY>outBoxPos.height){
          return;
        }
        //正确的起始坐标(吸边效果)
        const newStartPos = that.getNewStartPos(movePosObject.startX,movePosObject.startY);
        //左上角坐标
        movePosObject.x = newStartPos.x;
        movePosObject.y = newStartPos.y;
        let moveBeforeStartX = -1,moveBeforeStartY=-1,moveBeforeEndX = -1,moveBeforeEndY=-1;
        //拿移动的对比
        switch (type) {
          case "topleft":
            moveBeforeStartX = item.x;
            moveBeforeStartY = item.y;
            if(movePosObject.y<moveBeforeStartY||(Math.abs(movePosObject.startY-moveBeforeStartY)>=grid_height&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.y = movePosObject.y||0;
              that.resetGridLayoutPos(lsitem,-1,moveBeforeStartY);
              if(!that.switchItemObjectCross(lsitem)){
                item.y = movePosObject.y||0;
                that.resetGridLayoutPos(item,-1,moveBeforeStartY);
              }
            }
            if(movePosObject.x<moveBeforeStartX||(Math.abs(movePosObject.startX-moveBeforeStartX)>=grid_width&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,moveBeforeStartX,-1);
              if(!that.switchItemObjectCross(lsitem)){
                item.x = movePosObject.x||0;
                that.resetGridLayoutPos(item,moveBeforeStartX,-1);
              }
            }
            break;
          case "top":
            moveBeforeStartY = item.y;
            if(movePosObject.y<moveBeforeStartY||(Math.abs(movePosObject.startY-moveBeforeStartY)>=grid_height&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.y = movePosObject.y||0;
              that.resetGridLayoutPos(lsitem,-1,moveBeforeStartY);
              if(!that.switchItemObjectCross(lsitem)){
                item.y = movePosObject.y||0;
                that.resetGridLayoutPos(item,-1,moveBeforeStartY);
              }
            }
            break;
          case "topright":
            moveBeforeStartY = item.y;
            if(movePosObject.y<moveBeforeStartY||(Math.abs(movePosObject.startY-moveBeforeStartY)>=grid_height&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.y = movePosObject.y||0;
              that.resetGridLayoutPos(lsitem,-1,moveBeforeStartY);
              if(!that.switchItemObjectCross(lsitem)){
                item.y = movePosObject.y||0;
                that.resetGridLayoutPos(item,-1,moveBeforeStartY);
              }
            }
            moveBeforeEndX = item.x+(item.width/100)*outBoxPos.width;
            if((movePosObject.x<moveBeforeEndX&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))||movePosObject.startX-moveBeforeEndX>=0){
              //向上移动
              // item.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,-1,-1,movePosObject.x||-1,-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,movePosObject.x||-1,-1);
              }
            }
            break;
          case "left":
            moveBeforeStartX = item.x;
            if(movePosObject.x<moveBeforeStartX||(Math.abs(movePosObject.startX-moveBeforeStartX)>=grid_width&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,moveBeforeStartX,-1);
              if(!that.switchItemObjectCross(lsitem)){
                item.x = movePosObject.x||0;
                that.resetGridLayoutPos(item,moveBeforeStartX,-1);
              }
            }
            break;
          case "right":
            moveBeforeEndX = item.x+(item.width/100)*outBoxPos.width;
            // console.log(movePosObject.x,moveBeforeEndX)
            //左边坐标不变，width宽度增加
            if((movePosObject.x<moveBeforeEndX&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))||movePosObject.startX-moveBeforeEndX>=0){
              //向上移动
              // item.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,-1,-1,movePosObject.x||-1,-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,movePosObject.x||-1,-1);
              }
            }
            break;
          case "bottomleft":
            moveBeforeStartX = item.x;
            if(movePosObject.x<moveBeforeStartX||(Math.abs(movePosObject.startX-moveBeforeStartX)>=grid_width&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))){
              //向上移动
              lsitem.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,moveBeforeStartX,-1);
              if(!that.switchItemObjectCross(lsitem)){
                item.x = movePosObject.x||0;
                that.resetGridLayoutPos(item,moveBeforeStartX,-1);
              }
            }
            moveBeforeEndY = item.y+(item.height/100)*outBoxPos.height;
            if((movePosObject.y<moveBeforeEndY&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))||movePosObject.startY-moveBeforeEndY>=0){
              //向上移动
              that.resetGridLayoutPos(lsitem,-1,-1,-1,movePosObject.y||-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,-1,movePosObject.y||-1);
              }
            }
            break;
          case "bottom":
            moveBeforeEndY = item.y+(item.height/100)*outBoxPos.height;
            //左边坐标不变，height宽度增加
            if((movePosObject.y<moveBeforeEndY&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))||movePosObject.startY-moveBeforeEndY>=0){
              //向上移动
              that.resetGridLayoutPos(lsitem,-1,-1,-1,movePosObject.y||-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,-1,movePosObject.y||-1);
              }
            }
            break;
          case "bottomright":
            moveBeforeEndX = item.x+(item.width/100)*outBoxPos.width;
            moveBeforeEndY = item.y+(item.height/100)*outBoxPos.height;
            //左边坐标不变，width宽度增加
            if((movePosObject.x<moveBeforeEndX&&Math.round(item.width.toFixed(1))>(100/that.gridNumber))||movePosObject.startX-moveBeforeEndX>=0){
              //向上移动
              // item.x = movePosObject.x||0;
              that.resetGridLayoutPos(lsitem,-1,-1,movePosObject.x||-1,-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,movePosObject.x||-1,-1);
              }
            }
            //左边坐标不变，height宽度增加
            if((movePosObject.y<moveBeforeEndY&&Math.round(item.height.toFixed(1))>(100/that.gridNumber))||movePosObject.startY-moveBeforeEndY>=0){
              //向上移动
              that.resetGridLayoutPos(lsitem,-1,-1,-1,movePosObject.y||-1);
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutPos(item,-1,-1,-1,movePosObject.y||-1);
              }
            }
            break;
          case "center":
            //判断移动距离，上下左右,只对X轴,Y轴的起点坐标更改
            if(Math.abs(mouseStartPosObject.startX-movePosObject.startX)>=grid_width&&((mouseStartPosObject.startX>movePosObject.startX&&item.x-grid_width>=-2)||(mouseStartPosObject.startX<movePosObject.startX&&Math.round(item.x+(item.width/100)*outBoxPos.width+grid_width)<=outBoxPos.width))){
              that.resetGridLayoutCenter(lsitem,mouseStartPosObject,movePosObject,"h");
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutCenter(item,mouseStartPosObject,movePosObject,"h");
              }
              mouseStartPosObject.startX=_.cloneDeep(movePosObject.startX)
            }
            if(Math.abs(mouseStartPosObject.startY-movePosObject.startY)>=grid_height&&((mouseStartPosObject.startY>movePosObject.startY&&item.y-grid_height>=-2)||(mouseStartPosObject.startY<movePosObject.startY&&Math.round(item.y+(item.height/100)*outBoxPos.height+grid_height)<=outBoxPos.height))){
              that.resetGridLayoutCenter(lsitem,mouseStartPosObject,movePosObject,"v");
              if(!that.switchItemObjectCross(lsitem)){
                that.resetGridLayoutCenter(item,mouseStartPosObject,movePosObject,"v");
              }
              mouseStartPosObject.startY = _.cloneDeep(movePosObject.startY)
            }
            break;
        }
        that._stopPropagation(e);
      };
      var moveUpEvent = function(e) {
        item.moveActive = false;
        that.chooseGridList&&that.chooseGridList.forEach(item=>{
          item.moveActive = false;
        })
        that.chooseGridListFull&&that.chooseGridListFull.forEach(item=>{
          item.moveActive = false;
        })
        document.removeEventListener("mousemove",moveEvent);
        document.removeEventListener("mouseup",moveUpEvent);
      }
      document.addEventListener("mousemove",moveEvent);
      document.addEventListener("mouseup",moveUpEvent);
    },
    /**
     * 用其中的item来比较，既要判断item的四个点是否存在与循环的item范围中（要把item四个点进行相对于的差值再进行比较），又要判断循环item的四个点是否存在item的范围内（要把循环的item四个点进行相对于的差值再进行比较）
     */
    switchItemObjectCross(itemObject){
      let that = this;
      let result = false;
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //item的结束X坐标
      const itemObjectEndX = itemObject.x+((itemObject.width/100)*outBoxPos.width),
      //item的结束Y坐标
      itemObjectEndY = itemObject.y+((itemObject.height/100)*outBoxPos.height);
      this.chooseGridList&&this.chooseGridList.forEach(item=>{
        if(item.itemNo==itemObject.itemNo){
          return;
        }
        let topLeft = false,topRight = false,bottomLeft = false,bottomRight = false,cross = false;
        //item的结束X坐标
        const itemEndX = item.x+((item.width/100)*outBoxPos.width),
        //item的结束Y坐标
        itemEndY = item.y+((item.height/100)*outBoxPos.height);

        //左上角坐标：item.x,item.y
        if(itemObject.x<item.x+this.regionDiffNumPX&&item.x+this.regionDiffNumPX<itemObjectEndX&&itemObject.y<item.y+this.regionDiffNumPX&&item.y+this.regionDiffNumPX<itemObjectEndY){
          topLeft = true;
        }
        //右上角坐标：itemEndX,item.y
        if(itemObject.x<itemEndX-this.regionDiffNumPX&&itemEndX-this.regionDiffNumPX<itemObjectEndX&&itemObject.y<item.y+this.regionDiffNumPX&&item.y+this.regionDiffNumPX<itemObjectEndY){
          topRight = true;
        }
        //左下角坐标：item.x,itemEndY
        if(itemObject.x<item.x+this.regionDiffNumPX&&item.x+this.regionDiffNumPX<itemObjectEndX&&itemObject.y<itemEndY-this.regionDiffNumPX&&itemEndY-this.regionDiffNumPX<itemObjectEndY){
          bottomLeft = true;
        }
        //右下角坐标：itemEndX,itemEndY
        if(itemObject.x<itemEndX-this.regionDiffNumPX&&itemEndX-this.regionDiffNumPX<itemObjectEndX&&itemObject.y<itemEndY-this.regionDiffNumPX&&itemEndY-this.regionDiffNumPX<itemObjectEndY){
          bottomRight = true;
        }
        //这里应该计算 判断item的四个点是否存在与循环的item范围中
        //左上角坐标：itemObject.x，itemObject.y
        if(itemObject.x>item.x-this.regionDiffNumPX&&itemObject.x<itemEndX-this.regionDiffNumPX&&itemObject.y>item.y-this.regionDiffNumPX&&itemObject.y<itemEndY-this.regionDiffNumPX){
          topLeft = true;
        }
        //左下角坐标：itemObject.x，itemObjectEndY
        if(itemObject.x>item.x-this.regionDiffNumPX&&itemObject.x<itemEndX-this.regionDiffNumPX&&itemObjectEndY>item.y+this.regionDiffNumPX&&itemObjectEndY<itemEndY+this.regionDiffNumPX){
          bottomLeft = true;
        }
        //右上角坐标：itemObjectEndX,itemObject.y
        if(itemObjectEndX>item.x+this.regionDiffNumPX&&itemObjectEndX<itemEndX+this.regionDiffNumPX&&itemObject.y>item.y-this.regionDiffNumPX&&itemObject.y<itemEndY-this.regionDiffNumPX){
          topRight = true;
        }
        //右下角坐标：itemObjectEndX，itemObjectEndY
        if(itemObjectEndX>item.x+this.regionDiffNumPX&&itemObjectEndX<itemEndX+this.regionDiffNumPX&&itemObjectEndY>item.y+this.regionDiffNumPX&&itemObjectEndY<itemEndY+this.regionDiffNumPX)
        {
          bottomRight = true;
        }
        /**
         * itemObject为横向时候
          X：当前itemObject的起始坐标 小于 item的起始坐标 且itemObject的结束坐标 大于 item的结束坐标
          且
          Y：item的起始坐标 小于 itemObject的起始坐标   且 item的结束坐标  大于 itemObject的结束坐标
        */
        if(itemObject.x<item.x&&itemObjectEndX>itemEndX&&item.y<itemObject.y&&itemEndY>itemObjectEndY){
          cross = true;
        }

        /**
          itemObject为纵向时候
          X：item的起始坐标 小于 itemObject的起始坐标   且 item的结束坐标  大于 itemObject的结束坐标
          且
          Y：当前itemObject的起始坐标 小于 item的起始坐标 且itemObject的结束坐标 大于 item的结束坐标
        */
        if(item.x<itemObject.x&&itemEndX>itemObjectEndX&&itemObject.y<item.y&&itemObjectEndY>itemEndY){
          cross = true;
        }


        if(topLeft||topRight||bottomLeft||bottomRight||cross){
          result = true;
        }
      });
      return result;
    },
    /**
     * item 对象
     * mouseStartPosObject 鼠标开始位置
     * movePosObject 鼠标移动位置
     * type: 类型，v：上下，h：水平
     */
    resetGridLayoutCenter(item,mouseStartPosObject,movePosObject,type){
      let that = this;
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      if(type=="h"){
        //再判断往左还是往右
        if(mouseStartPosObject.startX>movePosObject.startX){
          //往左
          item.x = item.x-grid_width;
          item.xRatio = item.xRatio-100/that.gridNumber;
        }else{
          //往右
          item.x = item.x+grid_width;
          item.xRatio = item.xRatio+100/that.gridNumber;
        }
      }else if(type=="v"){
        //再判断往左还是往右
        if(mouseStartPosObject.startY>movePosObject.startY){
          //往左
          item.y = item.y-grid_height;
          item.yRatio = item.yRatio-100/that.gridNumber;
        }else{
          //往右
          item.y = item.y+grid_height;
          item.yRatio = item.yRatio+100/that.gridNumber;
        }
      }
      this.setPropDataToDevelopAttrData({chooseGridList:this.chooseGridList});
    },
    /**
     * 重新计算坐标
     */
    resetGridLayoutPos(item,moveBeforeStartX,moveBeforeStartY,moveBeforeEndX,moveBeforeEndY){
      let that = this;
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      if(moveBeforeStartX>-1){
        item.xRatio = (item.x/grid_width)*(100/that.gridNumber);
        //移动了X轴
        if(item.x<moveBeforeStartX){
          //增加
          item.width = item.width+Math.abs(moveBeforeStartX-item.x)/grid_width*(100/that.gridNumber);
        }else{
          //减少
          item.width = item.width-Math.abs(moveBeforeStartX-item.x)/grid_width*(100/that.gridNumber);
        }
      }
      if(moveBeforeStartY>-1){
        item.yRatio = (item.y/grid_height)*(100/that.gridNumber);
        //移动了Y轴
        if(item.y<moveBeforeStartY){
          //增加
          item.height = item.height+Math.abs(moveBeforeStartY-item.y)/grid_height*(100/that.gridNumber);
        }else{
          //减少
          item.height = item.height-Math.abs(moveBeforeStartY-item.y)/grid_height*(100/that.gridNumber);
        }
      }
      if(moveBeforeEndX>-1){
        //结尾才是正确，所以要增加一个单元格宽度
        moveBeforeEndX = moveBeforeEndX + grid_width;
        const itemEndX = item.x+(item.width/100)*outBoxPos.width;
        //增加和减少宽度
        if(itemEndX<moveBeforeEndX){
          //增加
          item.width = item.width+Math.abs(moveBeforeEndX-itemEndX)/grid_width*(100/that.gridNumber);
        }else{
          //减少
          item.width = item.width-Math.abs(moveBeforeEndX-itemEndX)/grid_width*(100/that.gridNumber);
        }
      }
      if(moveBeforeEndY>-1){
        //结尾才是正确，所以要增加一个单元格宽度
        moveBeforeEndY = moveBeforeEndY + grid_height;
        const itemEndY = item.y+(item.height/100)*outBoxPos.height;
        //增加和减少宽度
        if(itemEndY<moveBeforeEndY){
          //增加
          item.height = item.height+Math.abs(moveBeforeEndY-itemEndY)/grid_height*(100/that.gridNumber);
        }else{
          //减少
          item.height = item.height-Math.abs(moveBeforeEndY-itemEndY)/grid_height*(100/that.gridNumber);
        }
      }
      
      this.setPropDataToDevelopAttrData({chooseGridList:this.chooseGridList});
    },
    gridElementClickHandle(e,item){
      // console.log(e,item)
    },
    /**
     * 背景格子点击事件,绘制的开始
     */
    gridMousedownHandle(eT){
      //布局模式和非完整布局模式下不可新增布局
      if(this.layoutMode===1||this.layoutFooterMode > -1){
        return;
      }

      /**
       * getBoundingClientRect():{
            "x": 48.1875,
            "y": 46.84375,
            "width": 867.625,
            "height": 843.3125,
            "top": 46.84375,
            "right": 915.8125,
            "bottom": 890.15625,
            "left": 48.1875
        }
       */
      let that = this;
      that._stopPropagation(eT);
      //初始化移动坐标
      that.movePosObject={x:0,y:0,width:0,height:0,moveActive:false,minWidthShow:0,minHeightShow:0}
      that.__movePosObject = {x:0,y:0,width:0,height:0,moveActive:false,minWidthShow:0,minHeightShow:0}
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //单元格的宽与高
      const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      //鼠标按下的坐标
      const mouseDownPos = eT;
      //真实的起点坐标
      that.movePosObject.startX = mouseDownPos.clientX-outBoxPos.x;
      that.movePosObject.startY = mouseDownPos.clientY-outBoxPos.y;
      //正确的起始坐标(吸边效果)
      const newStartPos = this.getNewStartPos(that.movePosObject.startX,that.movePosObject.startY);
      that.movePosObject.x = newStartPos.x;
      that.movePosObject.y = newStartPos.y;
      that.movePosObject.xRatio = (newStartPos.x/grid_width)*(100/that.gridNumber);
      that.movePosObject.yRatio = (newStartPos.y/grid_height)*(100/that.gridNumber);
      //未移动点击的时候也要计算
      var resChooseWH = that.getChooseWH(that.movePosObject.startX,that.movePosObject.startY,{x:that.movePosObject.startX,y:that.movePosObject.startY})
      //获取到结束节点的坐标，用结束的进行计算，看跨过了几个节点，节点*宽度(高度)
      that.movePosObject.width=resChooseWH.width;
      that.movePosObject.height=resChooseWH.height;

      var moveEvent = function(e){
        that.switchAddGridList(e);
        that._stopPropagation(e);
      };
      var moveUpEvent = function(e) {
        document.removeEventListener("mousemove",moveEvent);
        document.removeEventListener("mouseup",moveUpEvent);
        if(!that.switchAddGridList(e,true)){
          //初始化移动坐标(清空)
          that.movePosObject={x:0,y:0,width:0,height:0,moveActive:false,minWidthShow:0,minHeightShow:0}
          return;
        }
        that.addMoveObjToGridList();
        // document.removeEventListener("mousemove",moveEvent);
        // document.removeEventListener("mouseup",moveUpEvent);
      }
      document.addEventListener("mousemove",moveEvent);
      document.addEventListener("mouseup",moveUpEvent);
      
    },
    addMoveObjToGridList(){
      let that = this;
      //获取最大的序号
      let maxNo = 0;
      that.chooseGridList.forEach(item=>{
        if(item.itemNo>maxNo){
          maxNo = item.itemNo;
        }
      })
      that.movePosObject.itemNo = maxNo+1;
      if(that.movePosObject.width>0&&that.movePosObject.height>0){
        //把已经选中的数据追加到chooseGridList当中
        that.chooseGridList.push(_.cloneDeep(that.movePosObject));
        //需要把数据调用插入到页面源码属性中
        this.setPropDataToDevelopAttrData({chooseGridList:this.chooseGridList});
      }
      //初始化移动坐标(清空)
      that.movePosObject={x:0,y:0,width:0,height:0,moveActive:false,minWidthShow:0,minHeightShow:0}

    },
    switchAddGridList(e,isAdd){
      let that = this;
      // if(isAdd){
      // }
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //单元格的宽与高
      const grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      var position = {};
      position.x = e.clientX-outBoxPos.x;
      position.y = e.clientY-outBoxPos.y;
      
      //这里需要判断坐标点是否已经在存在的范围内，如果存在则返回不再继续
      if(that.hasExistsGridLayout(position)){
        that.moveStatus = "existsInner";
        isAdd&&that.addMoveObjToGridList();
        return false;
      }
      var resStartPos = {x:that.movePosObject.x,y:that.movePosObject.y};
      //如果移动的坐标小于这需要更换，并且要计算宽高
      if(position.x<that.movePosObject.startX){
        resStartPos.x = position.x;
      }
      if(position.y<that.movePosObject.startY){
        resStartPos.y = position.y;
      }
      var resNewStartPos = that.getNewStartPos(resStartPos.x,resStartPos.y);
      var resChooseWH = that.getChooseWH(that.movePosObject.startX,that.movePosObject.startY,position)
      //这里还得继续判断四个坐标是否有交叉，有交叉则返回
      if(that.hasRegionExistsGridLayout(resNewStartPos,resChooseWH)){
        that.moveStatus = "existsCross";
        if(isAdd){
        that.movePosObject = _.cloneDeep(that.__movePosObject);
        }
        isAdd&&that.addMoveObjToGridList();
        return false;
      }
      //如果上一次是inner内则保留上一次的
      if(that.moveStatus == "existsInner"){
        // return;
        that.__movePosObject = _.cloneDeep(that.movePosObject);
      }
      that.moveStatus = "normal";

      that.movePosObject.x = _.cloneDeep(resNewStartPos.x);
      that.movePosObject.y = _.cloneDeep(resNewStartPos.y);
      that.movePosObject.xRatio = _.cloneDeep((resNewStartPos.x/grid_width)*(100/that.gridNumber));
      that.movePosObject.yRatio = _.cloneDeep((resNewStartPos.y/grid_height)*(100/that.gridNumber));

      //获取到结束节点的坐标，用结束的进行计算，看跨过了几个节点，节点*宽度(高度)
      that.movePosObject.width=_.cloneDeep(resChooseWH.width);
      that.movePosObject.height=_.cloneDeep(resChooseWH.height);
      return true;
    },
    /**
     * 判断已存在的区域是否在当前区域范围内
     * startPos:{x,y} 起始坐标
     * gridWH:{width,height} 区域的宽高，是百分比，需要进行转换
     */
    hasRegionExistsGridLayout(startPos,gridWH){
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //区域的结束坐标
      const regionEndX = startPos.x+((gridWH.width/100)*outBoxPos.width),
      regionEndY = startPos.y+((gridWH.height/100)*outBoxPos.height);
      let result = false;
      this.chooseGridList.forEach(item=>{
        let topLeft = false,topRight = false,bottomLeft = false,bottomRight = false,hx = false,zx = false;
        //item的结束X坐标
        const itemEndX = item.x+((item.width/100)*outBoxPos.width),
        //item的结束Y坐标
        itemEndY = item.y+((item.height/100)*outBoxPos.height);

        //左上角坐标：item.x,item.y
        if(startPos.x<item.x+this.regionDiffNumPX&&item.x+this.regionDiffNumPX<regionEndX&&startPos.y<item.y+this.regionDiffNumPX&&item.y+this.regionDiffNumPX<regionEndY){
          topLeft = true;
        }
        //右上角坐标：itemEndX,item.y
        if(startPos.x<itemEndX-this.regionDiffNumPX&&itemEndX-this.regionDiffNumPX<regionEndX&&startPos.y<item.y+this.regionDiffNumPX&&item.y+this.regionDiffNumPX<regionEndY){
          topRight = true;
        }
        //左下角坐标：item.x,itemEndY
        if(startPos.x<item.x+this.regionDiffNumPX&&item.x+this.regionDiffNumPX<regionEndX&&startPos.y<itemEndY-this.regionDiffNumPX&&itemEndY-this.regionDiffNumPX<regionEndY){
          bottomLeft = true;
        }
        //右下角坐标：itemEndX,itemEndY
        if(startPos.x<itemEndX-this.regionDiffNumPX&&itemEndX-this.regionDiffNumPX<regionEndX&&startPos.y<itemEndY-this.regionDiffNumPX&&itemEndY-this.regionDiffNumPX<regionEndY){
          bottomRight = true;
        }
        //当前为横向，item为纵向的交叉：当前起始Y轴与结束Y轴都要大于item的起始Y轴小于结束Y轴，且  ，item的起始X轴大于当前的X轴 且 item的结束X轴要小于当前的结束X轴
        if(startPos.y>item.y&&regionEndY>item.y&&startPos.y<itemEndY&&regionEndY<itemEndY
        &&item.x>startPos.x&&itemEndX<regionEndX
        ){
          hx = true;
        }
        //当前为纵向，item为横向的交叉：item的起始X轴小于当前的起始X轴  且  item的结束X轴大于当前的结束X轴  且  item的起始Y轴与结束Y轴都要大于当前的起始Y轴小于结束Y轴
        if(item.x<startPos.x&&itemEndX>startPos.x&&item.y>startPos.y&&itemEndY>startPos.y&&item.y<regionEndY&&itemEndY<regionEndY){
          zx = true;
        }
        if(topLeft||topRight||bottomLeft||bottomRight||hx||zx){
          result = true;
        }
      })
      return result;
    },
    /**
     * 判断当前鼠标的坐标点是否存在布局位置了,x,y都要判断
     * position：{x,y} 当前鼠标的位置
     */
    hasExistsGridLayout(position){
      //同一个元素x、y都有交叉才算存在，即item.x<position.x<item.x+((item.width/100)*outBoxPos.width) 且 y的也一样
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      let result = false;
      this.chooseGridList.forEach(item=>{
        if(item.x<position.x&&position.x<item.x+((item.width/100)*outBoxPos.width)&&item.y<position.y&&position.y<item.y+((item.height/100)*outBoxPos.height)){
          result = true;
        }
      })
      if(outBoxPos.width<=position.x||outBoxPos.height<=position.y){
        result = true;
      }
      return result;
    },
    /**
     * 获取框选的宽高
     * startX：起始坐标X
     * startY：起始坐标Y
     * mouseCurrentPos：{x:鼠标当前X坐标,y:鼠标当前Y坐标}
     */
    getChooseWH(startX,startY,mouseCurrentPos){
      //最后真实的起始的X轴坐标，Y轴坐标
      const x = this.movePosObject.x,y=this.movePosObject.y;
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //存储x，y的坐标数组，grid_width单元格的宽，grid_height单元格的高
      let x_coord_array = [],y_coord_array=[],grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      for (let index = 0; index < this.gridNumber; index++) {
        x_coord_array.push(index*grid_width);
        y_coord_array.push(index*grid_height);
      }
      //如果mouseCurrentPos小于startX，则用startX与x对比（反之用mouseCurrentPos），看中间跨了几个坐标点，跨了n*grid_width
      let xGridCount = 0;
      for (let index = 0; index < x_coord_array.length; index++) {
        const element = x_coord_array[index];
        if(element>=x&&element<=(startX>mouseCurrentPos.x?startX:mouseCurrentPos.x)){
          xGridCount++;
        }
      }
      let yGridCount = 0;
      for (let index = 0; index < y_coord_array.length; index++) {
        const element = y_coord_array[index];
        if(element>=y&&element<=(startY>mouseCurrentPos.y?startY:mouseCurrentPos.y)){
          yGridCount++;
        }
      }
      let regionWidth = xGridCount*(100/this.gridNumber),regionHeight = yGridCount*(100/this.gridNumber);
      //这里要判断最大宽与高，否则会重叠
      //区域的结束坐标
      const regionStartX = x<startX?x:startX,regionStartY = y<startY?y:startY,
      regionEndX =regionStartX+regionWidth,regionEndY = regionStartY+regionHeight;
      this.chooseGridList.forEach(item=>{
        //item的结束X坐标
        const itemEndX = item.x+((item.width/100)*outBoxPos.width),
        //item的结束Y坐标
        itemEndY = item.y+((item.height/100)*outBoxPos.height);
        /**
         * 宽度：下面条件满足取item的起始X轴坐标-当前的起始X轴坐标=（得出的为具体长度/grid_width）*（100/this.gridNumber）
          当前右下角的X轴坐标大于item的起始坐标小于结束坐标，且  右下角的Y轴坐标大于item的起始坐标小于结束坐标
          且
          当前右上角的X轴坐标大于item的起始坐标小于结束坐标，且  右上角的Y轴坐标大于item的起始坐标小于结束坐标
        */
        if(regionEndX-this.regionDiffNumPX>item.x&&regionEndX-this.regionDiffNumPX<itemEndX && regionEndY-this.regionDiffNumPX>item.y&&regionEndY-this.regionDiffNumPX<itemEndY
          &&
          regionStartY-this.regionDiffNumPX>item.y&&regionStartY-this.regionDiffNumPX<itemEndY
        ){
          regionWidth = item.x - regionStartX;
        }
        /**
         *高度：下面条件满足取item的起始Y轴坐标-当前的起始Y轴坐标=得出的为具体长度/grid_height）*（100/this.gridNumber）
          当前右下角的X轴坐标大于item的起始坐标小于结束坐标，且  右下角的Y轴坐标大于item的起始坐标小于结束坐标
          且
          当前左下角的X轴坐标大于item的起始坐标小于结束坐标，且  右下角的Y轴坐标大于item的起始坐标小于结束坐标
        */
        if(regionEndX-this.regionDiffNumPX>item.x&&regionEndX-this.regionDiffNumPX<itemEndX && regionEndY-this.regionDiffNumPX>item.y&&regionEndY-this.regionDiffNumPX<itemEndY
          &&
          regionStartX-this.regionDiffNumPX>item.x&&regionStartX-this.regionDiffNumPX<itemEndX
        ){
          regionHeight = item.y - regionStartY;
        }
      });


      return {width:regionWidth,height:regionHeight}
    },
    /**
     * 通过 gridNumber 计算边界，然后得出起始坐标
     */
    getNewStartPos(x,y){
      if(this.gridNumber==0){
        return {x:0,y:0}
      }
      //最外层盒子的坐标
      const outBoxPos = this.$refs.refFslBgGrid.getBoundingClientRect();
      //存储x，y的坐标数组，grid_width单元格的宽，grid_height单元格的高
      let x_coord_array = [],y_coord_array=[],grid_width=outBoxPos.width/this.gridNumber,grid_height=outBoxPos.height/this.gridNumber;
      for (let index = 0; index <= this.gridNumber; index++) {
        x_coord_array.push(index*grid_width);
        y_coord_array.push(index*grid_height);
      }
      let startX=x_coord_array[0],startY=y_coord_array[0];
      for (let index = 0; index < x_coord_array.length; index++) {
        const element = x_coord_array[index];
        if(x<element){
          //找到了比这个更大的就取上一个节点
          startX = x_coord_array[index-1];
          break;
        }
      }
      for (let index = 0; index < y_coord_array.length; index++) {
        const element = y_coord_array[index];
        if(y<element){
          //找到了比这个更大的就取上一个节点
          startY = y_coord_array[index-1];
          break;
        }
      }
      return {x:startX,y:startY};
    },
    /**
     * 阻止冒泡
     * @param {*} e 
     * @returns 
     */
    _stopPropagation: function(e) {
        e.stopPropagation();
        e.preventDefault();
        return false;
    },
    /**
     * 把组件的属性传递给开发环境的组件属性中
     * attrData:{attrKey1,attrKey2}  要变更的属性对象
     * attrDataInnerIndex:属性对应的类型，默认为-1是组件属性，如果为组件内部的容器属性，则需要传指定容器的idm-container-index
     */
    setPropDataToDevelopAttrData(attrData,attrDataInnerIndex){
      let newAttrData = attrData;
      if(this.layoutFooterMode===-1&&attrData&&attrData.chooseGridList){
        this.chooseGridListFull = _.cloneDeep(this.chooseGridList);
      }else if(this.layoutFooterMode>-1&&attrData&&attrData.chooseGridList){
        newAttrData = {chooseGridMediaList:_.cloneDeep(this.chooseGridMediaList)}
      }
      //modulePackageid:对应的组件包ID,
      //responseProps:是否响应props属性，默认为false，如果为true，将会调用idmProps方法把最新的熟悉传递给组件进行响应
      IDM.develop&&IDM.develop.externalMixAttributeChangeHandle(newAttrData,this.moduleObject.packageid,attrDataInnerIndex,false)
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.innerAttr = propData.innerAttr||[];
      this.convertAttrToStyleObject();
      this.converAttrToTable();
    },
    /**
     * 属性 适配布局 绑定页面
     */
    converAttrToTable () {
      if (this.moduleObject.env === 'develop') {
        const developEditInfo = IDM.develop.getDragWorkspaceInfo() || {};
        this.propData.fitMenu ? (this.computedWidth = {width: `calc(${developEditInfo.width}px - ${this.propData.menuWidthMax})`}) : (this.computedWidth = {});
      }
      if (this.propData.chooseGridMediaList.length > this.chooseGridMediaList.length) {
        this.addMediaObjectToList();
      }
      if (this.propData.chooseGridMediaList.length === this.chooseGridMediaList.length) {
        this.chooseGridMediaList.forEach((item, index) => {
          item.w = this.propData.chooseGridMediaList[index].w;
          item.h = this.propData.chooseGridMediaList[index].h;
          item.powerActive = this.propData.chooseGridMediaList[index].powerActive;
          item.isEdit = this.propData.chooseGridMediaList[index].isEdit;
          item.powerList = this.propData.chooseGridMediaList[index].powerList;
          item.isShowFunction = this.propData.chooseGridMediaList[index].isShowFunction;
        })
      }
      if (this.propData.chooseGridMediaList.length < this.chooseGridMediaList.length) {
        this.removeMediaObject({}, this.propData.chooseGridMediaList.length);
      }
      console.log(this.propData, '获取');
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
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object
     */
    receiveBroadcastMessage (object) {
      switch (object.type) {
        // 刷新菜单收缩 menuCollapse从菜单发起 true：收缩 false：展开
        case 'changeMenuCollapse':
          if (this.propData.fitMenu) {
            this.computedWidth = (object.message || {}).menuCollapse ? {width: `calc(${this.propData.width} - ${this.propData.menuWidthMin})`} : {width: `calc(${this.propData.width} - ${this.propData.menuWidthMax})`};
          }
          break;
        case 'resendAutoLayout':
          this.autoLayout();
          break;
      }
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      var styleObject = {};
      if(this.propData.bgSize&&this.propData.bgSize=="custom"){
        styleObject["background-size"]=(this.propData.bgSizeWidth?this.propData.bgSizeWidth.inputVal+this.propData.bgSizeWidth.selectVal:"auto")+" "+(this.propData.bgSizeHeight?this.propData.bgSizeHeight.inputVal+this.propData.bgSizeHeight.selectVal:"auto")
      }else if(this.propData.bgSize){
        styleObject["background-size"]=this.propData.bgSize;
      }
      if(this.propData.positionX&&this.propData.positionX.inputVal){
        styleObject["background-position-x"]=this.propData.positionX.inputVal+this.propData.positionX.selectVal;
      }
      if(this.propData.positionY&&this.propData.positionY.inputVal){
        styleObject["background-position-y"]=this.propData.positionY.inputVal+this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key]=element;
              break;
            case "bgColor":
              if(element.hex8){
                styleObject["background-color"]=element.hex8;
              }
              break;
            case "box":
              if(element.marginTopVal){
                styleObject["margin-top"]=`${element.marginTopVal}`;
              }
              if(element.marginRightVal){
                styleObject["margin-right"]=`${element.marginRightVal}`;
              }
              if(element.marginBottomVal){
                styleObject["margin-bottom"]=`${element.marginBottomVal}`;
              }
              if(element.marginLeftVal){
                styleObject["margin-left"]=`${element.marginLeftVal}`;
              }
              if(element.paddingTopVal){
                styleObject["padding-top"]=`${element.paddingTopVal}`;
              }
              if(element.paddingRightVal){
                styleObject["padding-right"]=`${element.paddingRightVal}`;
              }
              if(element.paddingBottomVal){
                styleObject["padding-bottom"]=`${element.paddingBottomVal}`;
              }
              if(element.paddingLeftVal){
                styleObject["padding-left"]=`${element.paddingLeftVal}`;
              }
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移
              
              break;
            case "positionY":
              //背景纵向偏移
              
              break;
            case "bgRepeat":
              //平铺模式
                styleObject["background-repeat"]=element;
              break;
            case "bgAttachment":
              //背景模式
                styleObject["background-attachment"]=element;
              break;
            case "border":
              if(element.border.top.width>0){
                styleObject["border-top-width"]=element.border.top.width+element.border.top.widthUnit;
                styleObject["border-top-style"]=element.border.top.style;
                if(element.border.top.colors.hex8){
                  styleObject["border-top-color"]=element.border.top.colors.hex8;
                }
              }
              if(element.border.right.width>0){
                styleObject["border-right-width"]=element.border.right.width+element.border.right.widthUnit;
                styleObject["border-right-style"]=element.border.right.style;
                if(element.border.right.colors.hex8){
                  styleObject["border-right-color"]=element.border.right.colors.hex8;
                }
              }
              if(element.border.bottom.width>0){
                styleObject["border-bottom-width"]=element.border.bottom.width+element.border.bottom.widthUnit;
                styleObject["border-bottom-style"]=element.border.bottom.style;
                if(element.border.bottom.colors.hex8){
                  styleObject["border-bottom-color"]=element.border.bottom.colors.hex8;
                }
              }
              if(element.border.left.width>0){
                styleObject["border-left-width"]=element.border.left.width+element.border.left.widthUnit;
                styleObject["border-left-style"]=element.border.left.style;
                if(element.border.left.colors.hex8){
                  styleObject["border-left-color"]=element.border.left.colors.hex8;
                }
              }
              
              styleObject["border-top-left-radius"]=element.radius.leftTop.radius+element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"]=element.radius.rightTop.radius+element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"]=element.radius.leftBottom.radius+element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"]=element.radius.rightBottom.radius+element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              styleObject["font-family"]=element.fontFamily;
              if(element.fontColors.hex8){
                styleObject["color"]=element.fontColors.hex8;
              }
              styleObject["font-weight"]=element.fontWeight&&element.fontWeight.split(" ")[0];
              styleObject["font-style"]=element.fontStyle;
              styleObject["font-size"]=element.fontSize+element.fontSizeUnit;
              styleObject["line-height"]=element.fontLineHeight+(element.fontLineHeightUnit=="-"?"":element.fontLineHeightUnit);
              styleObject["text-align"]=element.fontTextAlign;
              styleObject["text-decoration"]=element.fontDecoration;
              break;
            case "layout":
              if(element.display&&element.display=="flex"){
                if(element.direction){
                  styleObject["flex-direction"]=element.direction;
                }
                if(element.direction){
                  styleObject["align-items"]=element.align;
                }
                if(element.direction){
                  styleObject["justify-content"]=element.justify;
                }
              }else if(element.display){
                styleObject["display"]=element.display;
              }
              break;
          }
        }
      }
      IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
      if(this.innerAttr&&this.innerAttr.length>0){
        this.innerAttr.forEach(element => {
          this.convertInnerAttrToStyleObject(element.dataAttr,element.containerIndex);
        });
      }
      
      this.gridNumber = this.propData.gridNumber||this.gridNumber
    },
    /**
     * 把属性参数转换成内部容器样式对象
     */
    convertInnerAttrToStyleObject(propData,index){
      var styleObject = {};
      if(propData.bgSize&&propData.bgSize=="custom"){
        styleObject["background-size"]=(propData.bgSizeWidth?propData.bgSizeWidth.inputVal+propData.bgSizeWidth.selectVal:"auto")+" "+(propData.bgSizeHeight?propData.bgSizeHeight.inputVal+propData.bgSizeHeight.selectVal:"auto")
      }else if(propData.bgSize){
        styleObject["background-size"]=propData.bgSize;
      }
      if(propData.positionX&&propData.positionX.inputVal){
        styleObject["background-position-x"]=propData.positionX.inputVal+propData.positionX.selectVal;
      }
      if(propData.positionY&&propData.positionY.inputVal){
        styleObject["background-position-y"]=propData.positionY.inputVal+propData.positionY.selectVal;
      }
      for (const key in propData) {
        if (propData.hasOwnProperty.call(propData, key)) {
          const element = propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key]=element;
              break;
            case "bgColor":
              if(element.hex8){
                styleObject["background-color"]=element.hex8;
              }
              break;
            case "box":
              if(element.marginTopVal){
                styleObject["margin-top"]=`${element.marginTopVal}`;
              }
              if(element.marginRightVal){
                styleObject["margin-right"]=`${element.marginRightVal}`;
              }
              if(element.marginBottomVal){
                styleObject["margin-bottom"]=`${element.marginBottomVal}`;
              }
              if(element.marginLeftVal){
                styleObject["margin-left"]=`${element.marginLeftVal}`;
              }
              if(element.paddingTopVal){
                styleObject["padding-top"]=`${element.paddingTopVal}`;
              }
              if(element.paddingRightVal){
                styleObject["padding-right"]=`${element.paddingRightVal}`;
              }
              if(element.paddingBottomVal){
                styleObject["padding-bottom"]=`${element.paddingBottomVal}`;
              }
              if(element.paddingLeftVal){
                styleObject["padding-left"]=`${element.paddingLeftVal}`;
              }
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移
              
              break;
            case "positionY":
              //背景纵向偏移
              
              break;
            case "bgRepeat":
              //平铺模式
                styleObject["background-repeat"]=element;
              break;
            case "bgAttachment":
              //背景模式
                styleObject["background-attachment"]=element;
              break;
            case "border":
              if(element.border.top.width>0){
                styleObject["border-top-width"]=element.border.top.width+element.border.top.widthUnit;
                styleObject["border-top-style"]=element.border.top.style;
                if(element.border.top.colors.hex8){
                  styleObject["border-top-color"]=element.border.top.colors.hex8;
                }
              }
              if(element.border.right.width>0){
                styleObject["border-right-width"]=element.border.right.width+element.border.right.widthUnit;
                styleObject["border-right-style"]=element.border.right.style;
                if(element.border.right.colors.hex8){
                  styleObject["border-right-color"]=element.border.right.colors.hex8;
                }
              }
              if(element.border.bottom.width>0){
                styleObject["border-bottom-width"]=element.border.bottom.width+element.border.bottom.widthUnit;
                styleObject["border-bottom-style"]=element.border.bottom.style;
                if(element.border.bottom.colors.hex8){
                  styleObject["border-bottom-color"]=element.border.bottom.colors.hex8;
                }
              }
              if(element.border.left.width>0){
                styleObject["border-left-width"]=element.border.left.width+element.border.left.widthUnit;
                styleObject["border-left-style"]=element.border.left.style;
                if(element.border.left.colors.hex8){
                  styleObject["border-left-color"]=element.border.left.colors.hex8;
                }
              }
              
              styleObject["border-top-left-radius"]=element.radius.leftTop.radius+element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"]=element.radius.rightTop.radius+element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"]=element.radius.leftBottom.radius+element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"]=element.radius.rightBottom.radius+element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              styleObject["font-family"]=element.fontFamily;
              if(element.fontColors.hex8){
                styleObject["color"]=element.fontColors.hex8;
              }
              styleObject["font-weight"]=element.fontWeight&&element.fontWeight.split(" ")[0];
              styleObject["font-style"]=element.fontStyle;
              styleObject["font-size"]=element.fontSize+element.fontSizeUnit;
              styleObject["line-height"]=element.fontLineHeight+(element.fontLineHeightUnit=="-"?"":element.fontLineHeightUnit);
              styleObject["text-align"]=element.fontTextAlign;
              styleObject["text-decoration"]=element.fontDecoration;
              break;
            case "layout":
              styleObject["display"]=element.display;
              if(element.display&&element.display=="flex"){
                if(element.direction){
                  styleObject["flex-direction"]=element.direction;
                }
                if(element.direction){
                  styleObject["align-items"]=element.align;
                }
                if(element.direction){
                  styleObject["justify-content"]=element.justify;
                }
              }
              break;
          }
        }
      }
      IDM.setStyleToPageHead(this.moduleObject.id+` .drag_container[idm-ctrl-id="${this.moduleObject.id}"][idm-container-index="${index}"]`,styleObject);
      //设置追加页面宽与高
      this.chooseGridList&&this.chooseGridList.forEach(item=>{
        if(item.itemNo==index){
          item.minWidthShow = propData.minWidthShow||0;
          item.minHeightShow = propData.minHeightShow||0;
        }
      })
    }
  }
}
</script>
<style lang="scss">
.idm-full-screen-layout{
  position: relative;
  width: 100%;
  height: 100vh;
  padding: 0px;
  transition: width 0.2s linear;
  .idm-full-screen-layout-box{
    position: relative;
    height: 100%;
    width: 100%;
    cursor: crosshair;
    &.no-layout{
      cursor:inherit;
    }
    .fsl-bg-grid,.fsl-box-body{
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      >div{
        position: absolute;
      }
    }
    .fsl-bg-grid{
      z-index: 0;
      user-select: none;
      >.horizontal-line{
        left: 0;
        right: 0;
        border-bottom: 1px dashed #ddd;
      }
      >.vertical-line{
        top: 0;
        bottom: 0;
        border-left: 1px dashed #ddd;
      }
    }
    .fsl-box-body{
      z-index: 1;
      pointer-events: none;
      .fsl-region-element{
        border: 1px solid #1890ff;
        background-color: rgba($color: #1890ff, $alpha: 0.15);
        pointer-events:initial;
        cursor: pointer;
        overflow: hidden;
        .fsl-region-element-inner-develop,.fsl-region-element-inner-preview{
          position:absolute;
          left: 0;
          top: 0;
          bottom: 0;
          right: 0;
        }
        .fsl-region-element-inner-develop{
          transition: all linear 0.3s;
          z-index: 2;
          pointer-events: none;
          *{
            pointer-events: initial;
          }
          &>*:not(.default-show){
            opacity: 0;
            transition: all linear 0.3s;
          }
          .fsl-element-number{
            position: absolute;
            left: 12px;
            top: 12px;
            border: 1px solid #1890ff;
            width: 24px;
            height: 24px;
            border-radius: 17px;
            text-align: center;
            line-height: 22px;
            font-size: 12px;
            color: #1890ff;
          }
          .fsl-element-where-font{
            position: absolute;
            left: 10px;
            right: 10px;
            text-align: center;
            top: 50%;
            margin-top: -6px;
            font-size: 12px;
            color: #188fff83;
          }
          .fsl-element-ctrl-center{
            position: absolute;
            width: 32px;
            height: 32px;
            border-radius: 16px;
            left: 50%;
            top: 50%;
            margin-left: -16px;
            margin-top: -16px;
            background-color: #1890ff;
            cursor: move;
            text-align: center;
            svg{
              font-size: 28px;
              max-height: 28px;
              width: 28px;
              margin-top: 2px;
              fill: currentColor;
              vertical-align: middle;
              color: #ffffff;
            }
          }
          .fsl-element-item-delete{
            position: absolute;
            right: 10px;
            top: 10px;
            svg{
              font-size: 20px;
              max-height: 20px;
              width: 20px;
              fill: currentColor;
              vertical-align: middle;
              color: #1890ff;
            }
            transition: all linear 0.3s;
            &:hover{
            opacity: 1;
            }
          }
          .fsl-element-ctrl-anchor{
            position: absolute;
            width: 10px;
            height: 10px;
            background-color: #1890ff;
            &.fsl-element-ctrl-topleft{
              top: 0;
              left: 0;
              cursor: nw-resize;
            }
            &.fsl-element-ctrl-top{
              top: 0;
              left: 50%;
              margin-left: -5px;
              cursor: n-resize;
            }
            &.fsl-element-ctrl-topright{
              top: 0;
              right: 0;
              cursor: ne-resize;
            }
            &.fsl-element-ctrl-left{
              top: 50%;
              left: 0;
              margin-top: -5px;
              cursor: w-resize;
            }
            &.fsl-element-ctrl-right{
              top: 50%;
              right: 0;
              margin-top: -5px;
              cursor: e-resize;
            }
            &.fsl-element-ctrl-bottomleft{
              bottom: 0;
              left: 0;
              cursor: sw-resize;
            }
            &.fsl-element-ctrl-bottom{
              bottom: 0;
              left: 50%;
              margin-left: -5px;
              cursor: s-resize;
            }
            &.fsl-element-ctrl-bottomright{
              bottom: 0;
              right: 0;
              cursor: se-resize;
            }
          }
        }
        .fsl-region-element-inner-preview{
          z-index: 1;
        }
        &:not(.layout-mode-common,.module_env_production){
          &:hover,&.active{
            background-color: rgba($color: #1890ff, $alpha: 0.3);
            .fsl-region-element-inner-develop{
              *{
                opacity: 1;
                &.fsl-element-item-delete{
                  opacity: 0.7;
                }
              }
            }
          }
          .drag_container_empty{
            background: transparent;
            color: transparent;
            outline-color: transparent;
            height: 100% !important;
            &:before{
              content: none;
            }
          }
          .fsl-region-element-inner-preview{
            opacity: 0.1;
          }
        }
        &.layout-mode-common{
          border:none;
          background: none;
          cursor: inherit;
          .drag_container_empty{
            height: 100% !important;
          }
          .fsl-region-element-inner-preview{
            &:not(.drag_container_empty){
              border: 1px dashed #1890ff;
              background-color: rgba($color: #1890ff, $alpha: 0.1);
            }
          }
          &.module_env_production{
            .fsl-region-element-inner-preview{
              &:not(.drag_container_empty){
                border: none;
                background: none;
              }
            }
          }
        }
      }
    }
  }
  .fsl-layout-switch-tool,.fsl-layout-footer-switch-tool{
    position: absolute;
    cursor: pointer;
    height: 24px;
    border: 1px solid #1890ff;
    line-height: 22px;
    display: flex;
    >div{
      padding: 0px 10px;
      color: #1890ff;
      &.active{
        background-color: #1890ff;
        color: #ffffff;
      }
    }
  }
  .fsl-layout-switch-tool{
    z-index: 999;
    top: 0px;
  }
  .fsl-layout-footer-switch-tool{
    bottom: 0;
    z-index: 999;
    >div{
      border-right: 1px solid #1890ff;
      font-size: 12px;
      color: #666;
      i,svg{
        color: #1890ff;
      }
      &.active{
        color: #ffffff;
        i,svg{
          color: #ffffff;
        }
      }
      &:last-child{
        border-right: none;
      }
      input{
        border: none;
        outline: none;
        height: 22px;
        line-height: 22px;
        width: 100px;
        color: #666;
        margin: 0px 10px;
      }
    }
  }
  .fsl-mouse-region-element{
    position: absolute;
    border: 1px solid #1890ff;
    background-color: rgba($color: #1890ff, $alpha: 0.15);
  }
  
}
</style>