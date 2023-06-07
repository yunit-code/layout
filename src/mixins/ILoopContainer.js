export default {
    methods :{
        /**
         * 通用自定义函数
         * @param {*} propData 
         * @param {*} name 
         * @param {*} paramObject 
         * @returns 
         */
        commonCustomEventFunHandle(propData,name,paramObject){
          let that = this;
          propData = propData||this.propData;
          var customHandle = propData[name],resultData;
          let paramData = {
            ...that.commonParam(),
            _this: that,
          };
          if(paramObject){
            paramData={
              ...paramData,
              ...paramObject
            }
          }
          try {
            customHandle &&
            customHandle.forEach((item) => {
              resultData = window[item.name] &&
                window[item.name].call(this, {
                  ...paramData,
                  customParam: item.param
                });
            });
          } catch (error) {
            
          }
          return resultData
        },
        /**
         * 通用的url参数对象
         * 所有地址的url参数转换
         */
        commonParam(){
          let urlObject = IDM.url.queryObject();
          var params = {
            pageId:
              window.IDM.broadcast && window.IDM.broadcast.pageModule
                ? window.IDM.broadcast.pageModule.id
                : "",
            urlData: JSON.stringify(urlObject),
          };
          return params;
        }
    }
}