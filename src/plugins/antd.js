// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue';
import 'ant-design-vue/lib/button/style/css';
import 'ant-design-vue/lib/tabs/style/css';
import 'ant-design-vue/lib/icon/style/css';
import 'ant-design-vue/lib/tooltip/style/css';
import {
  Button,
  Tooltip,
  Icon,
  Tabs
} from 'ant-design-vue';

/* v1.1.3+ registration methods */
Vue.use(Button);
Vue.use(Tabs);
Vue.use(Tooltip);
Vue.use(Icon);