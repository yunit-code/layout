// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/tabs/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/tooltip/style/css';
import 'ant-design-vue/lib/dropdown/style/css';
import 'ant-design-vue/lib/menu/style/css';
import 'ant-design-vue/lib/collapse/style/css';
import {
  Button,
  Tooltip,
  Icon,
  Dropdown,
  Menu,
  Tabs,
  Collapse
} from 'ant-design-vue';
import Base from 'ant-design-vue/lib/base/index.js'

/* v1.1.3+ registration methods */
Vue.use(Button);
Tabs.install = function(){
  Vue.use(Base);
  Vue.component("layout220"+Tabs.name,Tabs);
  Vue.component("layout220"+Tabs.TabPane.name,Tabs.TabPane);
  Vue.component("layout220"+Tabs.TabContent.name,Tabs.TabContent);
}
Vue.use(Tabs);
Vue.use(Tooltip);
Vue.use(Icon);
Vue.use(Dropdown);
Vue.use(Menu);
Vue.use(Collapse);