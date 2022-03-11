<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="idm-columns-layout">
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
      :style="getColStyle(item,index + 1)"
      idm-ctrl-inner
      :idm-ctrl-id="moduleObject.id"
      :idm-container-index="index + 1"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'IGrid',
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{},
      innerAttr:this.$root.propData.innerAttr||[],
    }
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    // console.log(this.moduleObject)
    this.convertAttrToStyleObject();
  },
  mounted() {
  },
  destroyed() {},
  methods:{
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.innerAttr = propData.innerAttr||[];
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
    getColStyle(item,index){
      let styleObject = {};
      var colArray = (this.propData.grid || '12:12').split(':');
      if(this.propData.colPadding&&this.propData.colPadding.inputVal&&this.propData.colPadding.selectVal){
        if(index!=1){
          styleObject["padding-left"]=this.propData.colPadding.inputVal+this.propData.colPadding.selectVal;
        }
        if(index!=colArray.length){
          styleObject["padding-right"]=this.propData.colPadding.inputVal+this.propData.colPadding.selectVal;
        }
      }
      let colAttrObject = this.innerAttr.filter(item=>item.containerIndex==index);
      if(colAttrObject&&colAttrObject.length>0){
        var boxAttr = colAttrObject[0].dataAttr.box;
        if(boxAttr&&boxAttr.paddingLeftVal){
          styleObject["padding-left"]=boxAttr.paddingLeftVal;
        }
        if(boxAttr&&boxAttr.paddingRightVal){
          styleObject["padding-right"]=boxAttr.paddingRightVal;
        }
      }
      return styleObject;
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
    }
  }
}
</script>
<style lang="scss">
</style>